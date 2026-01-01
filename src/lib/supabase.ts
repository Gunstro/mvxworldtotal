import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        'Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
    )
}

// Use generic Supabase client without strict typing for now
// Once connected to a real database, run: npx supabase gen types typescript
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
        },
        realtime: {
            params: {
                eventsPerSecond: 10,
            },
        },
    }
)

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
    return (
        supabaseUrl &&
        supabaseAnonKey &&
        supabaseUrl !== 'https://placeholder.supabase.co'
    )
}
