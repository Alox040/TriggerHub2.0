$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$required = @("npm")
foreach ($cmd in $required) {
  if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
    throw "Missing required command: $cmd"
  }
}

$checks = @(
  "src/builder-core/index.js",
  "src/project-detector/index.js",
  "src/packager/index.js",
  "src/installer-generator/index.js",
  "src/ui/main.js",
  "src/ui/renderer/index.html"
)

foreach ($file in $checks) {
  if (-not (Test-Path $file)) {
    throw "Missing file: $file"
  }
}

Write-Host "Smoke test passed. EXE Builder scaffold is ready."
