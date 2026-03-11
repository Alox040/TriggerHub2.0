@echo off
set COMMAND=%1

if "%COMMAND%"=="release" (
  call npm.cmd run release
  exit /b %ERRORLEVEL%
)

echo Unknown command '%COMMAND%'. Supported: release
exit /b 1
