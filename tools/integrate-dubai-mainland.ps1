param(
    [Parameter(Mandatory = $true)]
    [string]$SourcePath
)

$ErrorActionPreference = "Stop"

$siteRoot = [System.IO.Path]::GetFullPath((Split-Path -Parent $PSScriptRoot))
$targetPath = Join-Path $siteRoot "dubai-mainland.html"
$cssPath = Join-Path $siteRoot "assets/css/pages/mainland-base.css"
$jsPath = Join-Path $siteRoot "assets/js/pages/mainland.js"
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)

if (-not (Test-Path -LiteralPath $SourcePath -PathType Leaf)) {
    throw "Source HTML was not found: $SourcePath"
}

function Find-MatchingBrace {
    param(
        [string]$Text,
        [int]$OpeningIndex
    )

    $depth = 0
    $quote = [char]0
    for ($index = $OpeningIndex; $index -lt $Text.Length; $index++) {
        $character = $Text[$index]
        if ($quote -ne [char]0) {
            if ($character -eq '\\') {
                $index++
                continue
            }
            if ($character -eq $quote) {
                $quote = [char]0
            }
            continue
        }
        if ($character -eq '"' -or $character -eq "'") {
            $quote = $character
            continue
        }
        if ($character -eq '{') {
            $depth++
        }
        elseif ($character -eq '}') {
            $depth--
            if ($depth -eq 0) {
                return $index
            }
        }
    }
    throw "Unbalanced CSS block starting at character $OpeningIndex"
}

function Add-CssScope {
    param(
        [string]$Css,
        [string]$Scope
    )

    $builder = [System.Text.StringBuilder]::new()
    $cursor = 0
    while ($cursor -lt $Css.Length) {
        $openingIndex = $Css.IndexOf('{', $cursor)
        if ($openingIndex -lt 0) {
            [void]$builder.Append($Css.Substring($cursor))
            break
        }

        $rawHeader = $Css.Substring($cursor, $openingIndex - $cursor)
        $leadingLength = $rawHeader.Length - $rawHeader.TrimStart().Length
        $leading = $rawHeader.Substring(0, $leadingLength)
        $header = $rawHeader.Trim()
        $closingIndex = Find-MatchingBrace -Text $Css -OpeningIndex $openingIndex
        $inner = $Css.Substring($openingIndex + 1, $closingIndex - $openingIndex - 1)

        [void]$builder.Append($leading)
        if ($header -match '^@(?:media|supports|layer)\b') {
            [void]$builder.Append($header)
            [void]$builder.Append('{')
            [void]$builder.Append((Add-CssScope -Css $inner -Scope $Scope))
            [void]$builder.Append('}')
        }
        elseif ($header -match '^@') {
            [void]$builder.Append($header)
            [void]$builder.Append('{')
            [void]$builder.Append($inner)
            [void]$builder.Append('}')
        }
        else {
            $scopedSelectors = foreach ($selector in ($header -split ',')) {
                $trimmed = $selector.Trim()
                if ($trimmed -in @(':root', 'html', 'body')) {
                    $Scope
                }
                else {
                    "$Scope $trimmed"
                }
            }
            [void]$builder.Append(($scopedSelectors -join ', '))
            [void]$builder.Append('{')
            [void]$builder.Append($inner)
            [void]$builder.Append('}')
        }
        $cursor = $closingIndex + 1
    }

    return $builder.ToString()
}

$sourceHtml = [System.IO.File]::ReadAllText($SourcePath)
$styleMatch = [regex]::Match($sourceHtml, '<style\b[^>]*>([\s\S]*?)</style>', 'IgnoreCase')
$mainMatch = [regex]::Match($sourceHtml, '<main\b[^>]*>([\s\S]*?)</main>', 'IgnoreCase')
if (-not $styleMatch.Success -or -not $mainMatch.Success) {
    throw "The source file must contain one <style> block and one <main> element."
}

$scopedCss = Add-CssScope -Css $styleMatch.Groups[1].Value -Scope '.mainland-redesign'
$scopedCss = @"
/* Page-specific styling imported from the approved Dubai Mainland design. */
$scopedCss
"@

$newBody = $mainMatch.Groups[1].Value
$newBody = [regex]::Replace(
    $newBody,
    '<nav\b[^>]*class="[^"]*\bcrumb\b[^"]*"[^>]*>[\s\S]*?</nav>',
    '',
    'IgnoreCase'
)

$imageReplacements = [ordered]@{
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&amp;fit=crop&amp;w=1300&amp;q=85' = 'assets/imgs/dubai-mainland/dubai-skyline.jpg'
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&amp;fit=crop&amp;w=1100&amp;q=85' = 'assets/imgs/dubai-mainland/commercial-architecture.jpg'
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&amp;fit=crop&amp;w=1900&amp;q=85' = 'assets/imgs/dubai-mainland/corporate-office.jpg'
    'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&amp;fit=crop&amp;w=1050&amp;q=85' = 'assets/imgs/dubai-mainland/business-documents.jpg'
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&amp;fit=crop&amp;w=1100&amp;q=85' = 'assets/imgs/dubai-mainland/advisory-team.jpg'
}
foreach ($replacement in $imageReplacements.GetEnumerator()) {
    $newBody = $newBody.Replace($replacement.Key, $replacement.Value)
}
$newBody = $newBody.Replace('href="/contact"', 'href="contact-us.html"')
$newBody = "<!-- Redesigned Dubai Mainland body -->`n<div class=`"mainland-redesign dubai-mainland-redesign`">$newBody</div>"

$faqScript = @'
/** Dubai Mainland page FAQ interaction. */
(function () {
  "use strict";

  document
    .querySelectorAll(".mainland-redesign .faq-q")
    .forEach(function (button) {
      button.addEventListener("click", function () {
        var item = button.closest(".faq-item");
        if (!item) return;

        var opening = !item.classList.contains("open");
        item.classList.toggle("open", opening);
        button.setAttribute("aria-expanded", String(opening));

        var indicator = button.lastElementChild;
        if (indicator) indicator.textContent = opening ? "−" : "+";
      });
    });
})();
'@

New-Item -ItemType Directory -Path (Split-Path -Parent $cssPath) -Force | Out-Null
New-Item -ItemType Directory -Path (Split-Path -Parent $jsPath) -Force | Out-Null
[System.IO.File]::WriteAllText($cssPath, $scopedCss, $utf8NoBom)
if (-not (Test-Path -LiteralPath $jsPath)) {
    [System.IO.File]::WriteAllText($jsPath, $faqScript, $utf8NoBom)
}

$targetHtml = [System.IO.File]::ReadAllText($targetPath)
$targetHtml = [regex]::Replace(
    $targetHtml,
    '\s*<link\s+rel="stylesheet"\s+href="/?assets/css/pages/dubai-mainland\.css"\s*/?>',
    '',
    'IgnoreCase'
)
$siteCssLink = '<link rel="stylesheet" href="assets/css/site.css" />'
if (-not $targetHtml.Contains($siteCssLink)) {
    throw "Could not find the shared site stylesheet link in $targetPath"
}
$targetHtml = $targetHtml.Replace(
    $siteCssLink,
    $siteCssLink + "`n    <link rel=`"stylesheet`" href=`"assets/css/pages/dubai-mainland.css`" />"
)

$bodyPattern = [regex]::new(
    '(?:<!-- Top Title Box -->|<!-- Redesigned Dubai Mainland body -->)[\s\S]*?(?=\s*</div>\s*<!-- Site footer -->)',
    [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
)
if ($bodyPattern.Matches($targetHtml).Count -ne 1) {
    throw "Could not identify exactly one current Dubai Mainland body region."
}
$targetHtml = $bodyPattern.Replace(
    $targetHtml,
    [System.Text.RegularExpressions.MatchEvaluator]{ param($match) $newBody },
    1
)

$pageScriptTag = '    <script src="assets/js/pages/mainland.js"></script>'
$targetHtml = [regex]::Replace(
    $targetHtml,
    '\s*<script\s+src="/?assets/js/pages/mainland\.js"\s*>\s*</script>',
    '',
    'IgnoreCase'
)
$sharedScriptMarker = '    <!-- Shared site scripts -->'
if (-not $targetHtml.Contains($sharedScriptMarker)) {
    throw "Could not find the shared script marker in $targetPath"
}
$targetHtml = $targetHtml.Replace(
    $sharedScriptMarker,
    $pageScriptTag + "`n" + $sharedScriptMarker
)

[System.IO.File]::WriteAllText($targetPath, $targetHtml, $utf8NoBom)
Write-Host "Integrated the scoped Dubai Mainland body, CSS, imagery, and FAQ behavior."
