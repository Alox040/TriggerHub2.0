param(
  [Parameter(Position = 0)]
  [string]$Command
)

switch ($Command) {
  "release" {
    npm.cmd run release
    exit $LASTEXITCODE
  }
  default {
    Write-Error "Unknown command '$Command'. Supported: release"
    exit 1
  }
}
