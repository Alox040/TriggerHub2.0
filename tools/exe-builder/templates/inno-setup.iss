#define MyAppName "EXE Builder App"
#define MyAppExeName "app.exe"

[Setup]
AppName={#MyAppName}
AppVersion=1.0.0
DefaultDirName={autopf}\{#MyAppName}
OutputBaseFilename=installer
Compression=lzma
SolidCompression=yes

[Files]
Source: "app.exe"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
