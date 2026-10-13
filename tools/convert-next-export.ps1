param(
    [switch]$ArchiveLegacyExport
)

$ErrorActionPreference = "Stop"

$siteRoot = [System.IO.Path]::GetFullPath((Split-Path -Parent $PSScriptRoot))
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)

$runtimeScripts = @(
    "assets/js/jquery-3.7.1.js",
    "assets/js/bootstrap.bundle.min.js",
    "assets/js/aos.js",
    "assets/js/swiper.min.js",
    "assets/js/waypoints.min.js",
    "assets/js/jquery.counterup.min.js",
    "assets/js/ajaxform.js",
    "assets/js/subscribeform.js",
    "assets/js/main.js",
    "assets/js/site.js",
    "assets/js/theme-boot.js"
)

$scriptBlock = @"

    <!-- Shared site scripts -->
$($runtimeScripts | ForEach-Object { "    <script src=`"$_`"></script>" } | Out-String)  </body>
"@

$pageFiles = @(
    Get-ChildItem -LiteralPath $siteRoot -File -Filter "*.html" |
        Sort-Object Name
)

$scriptPattern = [regex]::new(
    '<script\b[^>]*>[\s\S]*?</script>',
    [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
)
$nextLinkPattern = [regex]::new(
    '<link\b(?=[^>]*(?:href)\s*=\s*["'']/_next/)[^>]*>',
    [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
)

foreach ($page in $pageFiles) {
    $html = [System.IO.File]::ReadAllText($page.FullName)

    # Next-specific stylesheet and preload links are not needed once the static
    # pages load the theme assets directly.
    $html = $nextLinkPattern.Replace($html, "")

    # Remove both external framework scripts and React Server Component payloads.
    $html = $scriptPattern.Replace($html, {
        param($match)
        $tag = $match.Value
        if ($tag -match '(?i)\bsrc\s*=\s*["'']/_next/' -or $tag -match '__next_f') {
            return ""
        }
        return $tag
    })

    # Remove React streaming markers. They have no visual or functional role in
    # a traditional multi-page document.
    $html = [regex]::Replace($html, '<div\s+hidden(?:="")?>\s*<!--\$-->\s*<!--/\$-->\s*</div>', '', 'IgnoreCase')
    $html = $html.Replace('<!-- -->', '')
    $html = $html.Replace('<!--$-->', '')
    $html = $html.Replace('<!--/$-->', '')

    # Label the major editable regions without changing the rendered DOM.
    $regionMarkers = [ordered]@{
        '<div id="fixed-sidebar">'    = '<!-- Site sidebar -->'
        '<div class="header-bar-wrap">' = '<!-- Header contact bar -->'
        '<header class="header-wrap'   = '<!-- Primary navigation -->'
        '<div class="page-html">'      = '<!-- Page-specific content -->'
        '<footer class="footer-area">' = '<!-- Site footer -->'
    }
    foreach ($marker in $regionMarkers.Values) {
        $html = $html.Replace($marker, '')
    }
    foreach ($entry in $regionMarkers.GetEnumerator()) {
        $needle = $entry.Key
        $position = $html.IndexOf($needle, [System.StringComparison]::Ordinal)
        if ($position -ge 0) {
            $html = $html.Insert($position, "$($entry.Value)`n")
        }
    }

    # Keep the generated pages idempotent when this migration helper is re-run.
    foreach ($src in $runtimeScripts) {
        $escaped = [regex]::Escape($src)
        $html = [regex]::Replace(
            $html,
            "<script\b[^>]*\bsrc\s*=\s*[`"']/?$escaped[`"'][^>]*>\s*</script>",
            "",
            [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
        )
    }

    $html = [regex]::Replace($html, '<!--\s*Shared site scripts\s*-->', '', 'IgnoreCase')
    $html = [regex]::Replace($html, '<!DOCTYPE\s+html>', '<!doctype html>', 'IgnoreCase')

    if ($html -notmatch '(?i)</body>') {
        throw "Missing </body> in $($page.FullName)"
    }

    $html = [regex]::Replace($html, '(?i)\s*</body>', $scriptBlock, 1)
    # Keep generated pages portable between the domain root and /demo/.
    $html = [regex]::Replace($html, '(\b(?:href|src|action|poster)\s*=\s*["''])/(?!/)([^"'']*)(["''])', {
        param($match)
        $target = $match.Groups[2].Value
        if ($target.Length -eq 0 -or $target.StartsWith('?') -or $target.StartsWith('#')) {
            $target = 'index.html' + $target
        }
        return $match.Groups[1].Value + $target + $match.Groups[3].Value
    }, 'IgnoreCase')
    [System.IO.File]::WriteAllText($page.FullName, $html, $utf8NoBom)
}

if ($ArchiveLegacyExport) {
    $archiveRoot = [System.IO.Path]::GetFullPath((Join-Path $siteRoot "legacy-next-export"))
    $archiveInsideSite = $archiveRoot.StartsWith(
        $siteRoot + [System.IO.Path]::DirectorySeparatorChar,
        [System.StringComparison]::OrdinalIgnoreCase
    )
    if (-not $archiveInsideSite) {
        throw "Refusing to create archive outside the site root: $archiveRoot"
    }
    New-Item -ItemType Directory -Path $archiveRoot -Force | Out-Null

    $legacyDirectories = @("_next", "_not-found", "404")
    foreach ($name in $legacyDirectories) {
        $target = [System.IO.Path]::GetFullPath((Join-Path $siteRoot $name))
        $insideSite = $target.StartsWith(
            $siteRoot + [System.IO.Path]::DirectorySeparatorChar,
            [System.StringComparison]::OrdinalIgnoreCase
        )
        if (-not $insideSite) {
            throw "Refusing to move path outside the site root: $target"
        }
        if (Test-Path -LiteralPath $target) {
            $destination = Join-Path $archiveRoot $name
            if (Test-Path -LiteralPath $destination) {
                throw "Archive destination already exists: $destination"
            }
            Move-Item -LiteralPath $target -Destination $destination
        }
    }

    $routeDataRoot = Join-Path $archiveRoot "route-data"
    $nestedNextDirectories = Get-ChildItem -LiteralPath $siteRoot -Recurse -Directory |
        Where-Object {
            -not $_.FullName.StartsWith($archiveRoot, [System.StringComparison]::OrdinalIgnoreCase) -and
            $_.Name -like "__next*"
        } |
        Sort-Object { $_.FullName.Length } -Descending
    foreach ($directory in $nestedNextDirectories) {
        $relative = [System.IO.Path]::GetRelativePath($siteRoot, $directory.FullName)
        $destination = Join-Path $routeDataRoot $relative
        $destinationParent = Split-Path -Parent $destination
        New-Item -ItemType Directory -Path $destinationParent -Force | Out-Null
        if (Test-Path -LiteralPath $destination) {
            throw "Archive destination already exists: $destination"
        }
        Move-Item -LiteralPath $directory.FullName -Destination $destination
    }

    $routePayloads = Get-ChildItem -LiteralPath $siteRoot -Recurse -File |
        Where-Object {
            -not $_.FullName.StartsWith($archiveRoot, [System.StringComparison]::OrdinalIgnoreCase) -and
            ($_.Name -like "__next*.txt" -or $_.Name -eq "index.txt")
        }
    foreach ($payload in $routePayloads) {
        $relative = [System.IO.Path]::GetRelativePath($siteRoot, $payload.FullName)
        $destination = Join-Path $routeDataRoot $relative
        $destinationParent = Split-Path -Parent $destination
        New-Item -ItemType Directory -Path $destinationParent -Force | Out-Null
        Move-Item -LiteralPath $payload.FullName -Destination $destination
    }

    $unusedStarterAssets = @("file.svg", "globe.svg", "next.svg", "vercel.svg", "window.svg", "icon.png")
    $starterArchive = Join-Path $archiveRoot "starter-assets"
    foreach ($name in $unusedStarterAssets) {
        $target = Join-Path $siteRoot $name
        if (Test-Path -LiteralPath $target) {
            New-Item -ItemType Directory -Path $starterArchive -Force | Out-Null
            Move-Item -LiteralPath $target -Destination (Join-Path $starterArchive $name)
        }
    }
}

Write-Host "Converted $($pageFiles.Count) HTML pages to direct static runtime loading."
if ($ArchiveLegacyExport) {
    Write-Host "Archived legacy Next.js payloads and unused starter assets under legacy-next-export/."
}
