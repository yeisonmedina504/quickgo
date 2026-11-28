/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base de la API (por defecto "/api", con proxy de Vite hacia el backend). */
  readonly VITE_API_URL?: string
  /** "true" para usar datos de demostración sin backend. */
  readonly VITE_API_MOCKS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
