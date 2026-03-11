param(
  [Parameter(Mandatory = $false)]
  [string]$ProjectPath,

  [Parameter(Mandatory = $false)]
  [string]$OutputPath,

  [Parameter(Mandatory = $false)]
  [ValidateSet("auto", "electron-builder", "pyinstaller", "pkg", "tauri")]
  [string]$Packager = "auto",

  [Parameter(Mandatory = $false)]
  [ValidateSet("none", "nsis", "inno-setup")]
  [string]$Installer = "none"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  throw "npm is required"
}

if (-not (Test-Path "$root/node_modules/electron")) {
  Write-Host "Installing dependencies..."
  npm install
}

if ($ProjectPath -or $OutputPath) {
  Write-Host "Use the desktop UI for folder selection and logs."
  Write-Host "ProjectPath: $ProjectPath"
  Write-Host "OutputPath: $OutputPath"
  Write-Host "Packager: $Packager"
  Write-Host "Installer: $Installer"
}

npm run start
