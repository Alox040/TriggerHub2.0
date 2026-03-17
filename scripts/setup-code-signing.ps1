[CmdletBinding()]
param(
  [string]$OutputPath = "build\codesign\triggerhub-codesign.pfx"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not $env:TRIGGERHUB_WINDOWS_CERT_BASE64) {
  Write-Host "No certificate material found in TRIGGERHUB_WINDOWS_CERT_BASE64. Skipping code-signing setup."
  exit 0
}

if (-not $env:TRIGGERHUB_WINDOWS_CERT_PASSWORD) {
  throw "TRIGGERHUB_WINDOWS_CERT_PASSWORD is required when certificate material is provided."
}

$targetPath = Join-Path (Get-Location) $OutputPath
$targetDirectory = Split-Path -Parent $targetPath

New-Item -ItemType Directory -Path $targetDirectory -Force | Out-Null
[IO.File]::WriteAllBytes($targetPath, [Convert]::FromBase64String($env:TRIGGERHUB_WINDOWS_CERT_BASE64))

$env:CSC_LINK = $targetPath
$env:CSC_KEY_PASSWORD = $env:TRIGGERHUB_WINDOWS_CERT_PASSWORD

Write-Host "Code-signing certificate materialized at $targetPath."
Write-Host "CSC_LINK and CSC_KEY_PASSWORD are set for the current PowerShell session."
