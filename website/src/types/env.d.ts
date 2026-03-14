/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_APP_ENV?: string
  readonly VITE_ACCESS_MODE?: string
  readonly VITE_SESSION_TTL_MS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
