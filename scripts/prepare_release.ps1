<#
prepare_release.ps1
Copies the universal APK to ./release and creates a ZIP archive for easier upload.
Usage: from repo root in PowerShell:
  .\scripts\prepare_release.ps1
Optional parameter: -ApkPath "path\to\apk" to override the default.
#>
param(
    [string]$ApkPath = "android\app\build\outputs\apk\release\app-universal-release.apk",
    [switch]$Zip = $true
)

try {
    $repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition | Split-Path -Parent
    Set-Location -Path $repoRoot
} catch {
    # ignore; assume current dir is repo root
}

if (-not (Test-Path $ApkPath)) {
    Write-Host "APk not found at $ApkPath"
    Write-Host "Looking for other release APKs in android\\app\\build\\outputs\\apk\\release..."
    $candidates = Get-ChildItem -Path "android\\app\\build\\outputs\\apk\\release" -Filter "*.apk" | Sort-Object Length -Descending
    if ($candidates.Count -gt 0) {
        $ApkPath = $candidates[0].FullName
        Write-Host "Using largest APK found: $ApkPath"
    } else {
        Write-Error "No APKs found. Run .\\gradlew assembleRelease first."
        exit 1
    }
}

$releaseDir = Join-Path -Path (Get-Location) -ChildPath "release"
if (-not (Test-Path $releaseDir)) { New-Item -ItemType Directory -Path $releaseDir | Out-Null }

$dest = Join-Path $releaseDir (Split-Path $ApkPath -Leaf)
Copy-Item -Path $ApkPath -Destination $dest -Force
Write-Host "Copied APK to: $dest"

if ($Zip) {
    $zipPath = Join-Path $releaseDir "app-release.zip"
    if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
    Compress-Archive -Path $dest -DestinationPath $zipPath
    Write-Host "Created ZIP: $zipPath"
}

# Open the release folder in explorer so you can manually upload quickly
Start-Process -FilePath (Resolve-Path $releaseDir)
Write-Host "Release folder opened. Upload the APK or ZIP to OneDrive (or use the OneDrive client)."