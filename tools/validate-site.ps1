$ErrorActionPreference = "Stop"

$siteRoot = [System.IO.Path]::GetFullPath((Split-Path -Parent $PSScriptRoot))
$pageFiles = @(
    Get-ChildItem -LiteralPath $siteRoot -File -Filter "*.html" |
        Sort-Object Name
)

$expectedScripts = @(
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

$errors = [System.Collections.Generic.List[string]]::new()
$warnings = [System.Collections.Generic.List[string]]::new()
$internalLinks = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
$referencedFiles = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)

function Resolve-SitePath([string]$url, [string]$baseDirectory, [string]$source) {
    $clean = ([System.Net.WebUtility]::HtmlDecode($url) -split '[?#]', 2)[0]
    if ([string]::IsNullOrWhiteSpace($clean)) { return $null }
    if ($clean -match '^(?i)([a-z][a-z0-9+.-]*:|//)') { return $null }

    if ($clean.StartsWith('/')) {
        $errors.Add("$source uses a root-relative URL that breaks subfolder hosting: $url")
        return $null
    }
    $resolved = [System.IO.Path]::GetFullPath((Join-Path $baseDirectory ([System.Uri]::UnescapeDataString($clean))))
    $insideSite = $resolved -eq $siteRoot -or $resolved.StartsWith(
        $siteRoot + [System.IO.Path]::DirectorySeparatorChar,
        [System.StringComparison]::OrdinalIgnoreCase
    )
    if (-not $insideSite) {
        $errors.Add("$source references a path outside the site: $url")
        return $null
    }
    return $resolved
}

foreach ($page in $pageFiles) {
    $relativePage = [System.IO.Path]::GetRelativePath($siteRoot, $page.FullName)
    $html = [System.IO.File]::ReadAllText($page.FullName)

    if ($html -match '(?i)(/_next/|__next_f|TURBOPACK)') {
        $errors.Add("$relativePage still contains a Next.js runtime reference")
    }
    foreach ($required in @('<html', '<head', '</head>', '<body', '</body>', '</html>')) {
        if ($html.IndexOf($required, [System.StringComparison]::OrdinalIgnoreCase) -lt 0) {
            $errors.Add("$relativePage is missing $required")
        }
    }

    $scriptSources = [regex]::Matches($html, '<script\b[^>]*\bsrc\s*=\s*["'']([^"'']+)["''][^>]*>', 'IgnoreCase') |
        ForEach-Object { $_.Groups[1].Value }
    $sharedScriptSources = @($scriptSources | Where-Object { $_ -notlike 'assets/js/pages/*' })
    if (($sharedScriptSources -join '|') -ne ($expectedScripts -join '|')) {
        $errors.Add("$relativePage does not use the expected script order")
    }

    $urls = [regex]::Matches($html, '\b(?:src|href|action|poster)\s*=\s*["'']([^"'']+)["'']', 'IgnoreCase') |
        ForEach-Object { $_.Groups[1].Value }
    foreach ($url in $urls) {
        $resolved = Resolve-SitePath $url $page.Directory.FullName $relativePage
        if ($null -eq $resolved) { continue }

        $cleanUrl = ($url -split '[?#]', 2)[0]
        if ($cleanUrl.StartsWith('assets/') -or $cleanUrl -eq 'favicon.ico') {
            [void]$referencedFiles.Add($cleanUrl)
            if (-not (Test-Path -LiteralPath $resolved -PathType Leaf)) {
                $errors.Add("$relativePage references missing asset $cleanUrl")
            }
            continue
        }

        [void]$internalLinks.Add($cleanUrl)
        $routeExists = (Test-Path -LiteralPath $resolved -PathType Leaf) -or
            (Test-Path -LiteralPath (Join-Path $resolved 'index.html') -PathType Leaf)
        if (-not $routeExists) {
            $errors.Add("$relativePage links to missing route $cleanUrl")
        }
    }

    $forms = [regex]::Matches($html, '<form\b[^>]*>', 'IgnoreCase')
    foreach ($form in $forms) {
        $idMatch = [regex]::Match($form.Value, '\bid\s*=\s*["'']([^"'']+)["'']', 'IgnoreCase')
        $formId = if ($idMatch.Success) { $idMatch.Groups[1].Value } else { '(no id)' }
        $isKnownSharedForm = $formId -in @('ajax-form', 'subscribe-form')
        $isTrackedLeadForm = $form.Value -match '\bdata-lead-form\s*='
        if (-not $isKnownSharedForm -and -not $isTrackedLeadForm) {
            $warnings.Add("$relativePage contains unrecognised form hook #$formId")
        }
    }
}

$cssFiles = Get-ChildItem -LiteralPath (Join-Path $siteRoot 'assets/css') -Recurse -File -Filter '*.css'
foreach ($css in $cssFiles) {
    $cssText = [System.IO.File]::ReadAllText($css.FullName)
    $cssText = [regex]::Replace($cssText, '/\*[\s\S]*?\*/', '')
    $assetUrls = [regex]::Matches($cssText, 'url\(\s*["'']?([^\)"'']+)', 'IgnoreCase') |
        ForEach-Object { $_.Groups[1].Value }
    foreach ($url in $assetUrls) {
        $relativeCss = [System.IO.Path]::GetRelativePath($siteRoot, $css.FullName)
        $resolved = Resolve-SitePath $url.Trim() $css.Directory.FullName $relativeCss
        if ($null -eq $resolved) { continue }
        if (-not (Test-Path -LiteralPath $resolved -PathType Leaf)) {
            $errors.Add("$([System.IO.Path]::GetRelativePath($siteRoot, $css.FullName)) references missing asset $url")
        }
    }
}

$duplicateErrors = $errors | Sort-Object -Unique
$duplicateWarnings = $warnings | Sort-Object -Unique

Write-Host "Pages checked: $($pageFiles.Count)"
Write-Host "Internal routes checked: $($internalLinks.Count)"
Write-Host "Referenced static files checked: $($referencedFiles.Count)"

if ($duplicateWarnings.Count -gt 0) {
    Write-Warning ($duplicateWarnings -join [Environment]::NewLine)
}
if ($duplicateErrors.Count -gt 0) {
    $duplicateErrors | ForEach-Object { Write-Host "ERROR: $_" -ForegroundColor Red }
    exit 1
}

Write-Host "Validation passed: HTML structure, folder-relative routes and assets, forms, and script order are consistent."
