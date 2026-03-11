# Architecture

```text
/tools/exe-builder
  /src
    /builder-core
      index.js
    /project-detector
      index.js
    /packager
      index.js
    /installer-generator
      index.js
    /ui
      main.js
      preload.js
      /renderer
        index.html
        styles.css
        renderer.js
    /utils
      fs-utils.js
      process-runner.js
    types.js
  /scripts
    run-builder.ps1
    smoke-test.ps1
  /templates
    nsis-installer.nsi
    inno-setup.iss
```

## Module Responsibilities

- `project-detector`: scans project folder markers and classifies app type.
- `builder-core`: orchestrates full pipeline and reports progress.
- `packager`: dependency install, build execution, and EXE packaging using configured strategy.
- `installer-generator`: optional installer generation via NSIS or Inno Setup.
- `ui`: Electron desktop shell with progress and artifact output.
- `utils`: filesystem and child process helpers.

## Execution Flow

1. User selects folders and options in UI.
2. UI sends `start-build` IPC request.
3. `builder-core` runs detection -> dependencies -> build -> package -> installer.
4. Progress logs stream to renderer.
5. Final EXE and installer paths are returned.
