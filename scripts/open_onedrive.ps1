<#
open_onedrive.ps1
Opens the provided OneDrive folder URL in the default web browser so you can manually upload the APK.
Usage:
  .\scripts\open_onedrive.ps1
or
  .\scripts\open_onedrive.ps1 -Url "https://..."
#>
param(
    [string]$Url = 'https://ilmach-my.sharepoint.com/:f:/p/shahbaz/EtpBQYKXNEFOpyPHG2E0bWIBaAs6A0jhrwKbMn7S6fojoA?e=l7Jt8I'
)

Write-Host "Opening OneDrive folder in your browser:`n$Url"
Start-Process -FilePath $Url
Write-Host "After browser opens, sign in if required and use Upload -> Files to upload the APK or ZIP from ./release."