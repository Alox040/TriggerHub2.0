!include "MUI2.nsh"
Name "EXE Builder App"
OutFile "installer.exe"
InstallDir "$PROGRAMFILES\EXE Builder App"
Page directory
Page instfiles
Section
  SetOutPath "$INSTDIR"
  File "app.exe"
SectionEnd
