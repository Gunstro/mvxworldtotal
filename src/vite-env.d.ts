/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_ANON_KEY: string
    readonly VITE_APP_NAME: string
    readonly VITE_APP_URL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

// CSS modules
declare module '*.css' {
    const content: { [className: string]: string }
    export default content
}
