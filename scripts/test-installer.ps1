[CmdletBinding()]
param(
  [string]$ArtifactsDir = "dist"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Assert-FileExists {
  param([string]$Path, [string]$Message)

  if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
    throw $Message
  }
}

function Start-SmokeProcess {
  param(
    [string]$ExecutablePath,
    [string]$Label
  )

  $process = Start-Process -FilePath $ExecutablePath -PassThru
  Start-Sleep -Seconds 5

  if (-not $process.HasExited) {
    Stop-Process -Id $process.Id -Force
  }

  Write-Host "$Label smoke run completed: $ExecutablePath"
}

$resolvedArtifactsDir = Join-Path (Get-Location) $ArtifactsDir
$setupPath = Join-Path $resolvedArtifactsDir "Setup.exe"
$portablePath = Join-Path $resolvedArtifactsDir "App.exe"

Assert-FileExists -Path $setupPath -Message "Missing installer artifact: $setupPath"
Assert-FileExists -Path $portablePath -Message "Missing portable artifact: $portablePath"

Start-SmokeProcess -ExecutablePath $portablePath -Label "Portable executable"

$installRoot = Join-Path ([IO.Path]::GetTempPath()) "TriggerHubInstallerSmoke"
if (Test-Path -LiteralPath $installRoot) {
  Remove-Item -LiteralPath $installRoot -Recurse -Force
}

New-Item -ItemType Directory -Path $installRoot -Force | Out-Null
$installDirArgument = "/D=$installRoot"
$install = Start-Process -FilePath $setupPath -ArgumentList @("/S", "/CURRENTUSER", $installDirArgument) -Wait -PassThru

if ($install.ExitCode -ne 0) {
  throw "Silent installer exited with code $($install.ExitCode)."
}

$installedExe = Get-ChildItem -Path $installRoot -Recurse -Filter *.exe |
  Where-Object { $_.Name -in @("TriggerHub.exe", "App.exe") } |
  Select-Object -First 1

if (-not $installedExe) {
  throw "Installed executable not found under $installRoot."
}

Start-SmokeProcess -ExecutablePath $installedExe.FullName -Label "Installed application"

$uninstaller = Get-ChildItem -Path $installRoot -Recurse -Filter *unins*.exe |
  Select-Object -First 1

if (-not $uninstaller) {
  $uninstaller = Get-ChildItem -Path $installRoot -Recurse -Filter Uninstall.exe |
    Select-Object -First 1
}

if (-not $uninstaller) {
  throw "Installed uninstaller not found under $installRoot."
}

$uninstall = Start-Process -FilePath $uninstaller.FullName -ArgumentList "/S" -Wait -PassThru
if ($uninstall.ExitCode -ne 0) {
  throw "Silent uninstaller exited with code $($uninstall.ExitCode)."
}

Start-Sleep -Seconds 2
if (Test-Path -LiteralPath $installedExe.FullName) {
  throw "Installed executable still present after uninstall: $($installedExe.FullName)"
}

if (Test-Path -LiteralPath $installRoot) {
  Remove-Item -LiteralPath $installRoot -Recurse -Force
}

Write-Host "Installer smoke test completed successfully."
