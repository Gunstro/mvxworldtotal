import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import type { Profile, MegaBucksWallet, MegaScore } from '@/types/database'
import { supabase } from '@/lib/supabase'

interface AuthState {
    // Auth state
    user: User | null
    session: Session | null
    profile: Profile | null
    wallet: MegaBucksWallet | null
    megaScore: MegaScore | null
    isLoading: boolean
    isInitialized: boolean

    // Actions
    initialize: () => Promise<void>
    setUser: (user: User | null) => void
    setSession: (session: Session | null) => void
    setProfile: (profile: Profile | null) => void
    fetchProfile: () => Promise<void>
    fetchWallet: () => Promise<void>
    fetchMegaScore: () => Promise<void>
    signUp: (email: string, password: string, username: string, visaId?: string) => Promise<void>
    signIn: (email: string, password: string) => Promise<void>
    signOut: () => Promise<void>
    updateProfile: (updates: Partial<Profile>) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            // Initial state
            user: null,
            session: null,
            profile: null,
            wallet: null,
            megaScore: null,
            isLoading: true,
            isInitialized: false,

            // Initialize auth state from Supabase
            initialize: async () => {
                try {
                    const { data: { session } } = await supabase.auth.getSession()

                    if (session?.user) {
                        set({ user: session.user, session })
                        await get().fetchProfile()
                        await get().fetchWallet()
                        await get().fetchMegaScore()
                    }

                    // Listen for auth changes
                    supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
                        set({ user: session?.user ?? null, session })

                        if (session?.user) {
                            await get().fetchProfile()
                            await get().fetchWallet()
                        } else {
                            set({ profile: null, wallet: null, megaScore: null })
                        }
                    })
                } catch (error) {
                    console.error('Auth initialization error:', error)
                } finally {
                    set({ isLoading: false, isInitialized: true })
                }
            },

            setUser: (user) => set({ user }),
            setSession: (session) => set({ session }),
            setProfile: (profile) => set({ profile }),

            // Fetch current user's profile
            fetchProfile: async () => {
                const { user } = get()
                if (!user) return

                // Fetch from profiles table (single source of truth)
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (error) {
                    console.error('Error fetching profile:', error)
                    return
                }

                set({
                    profile: data as Profile
                })
            },

            // Fetch current user's MegaBucks wallet
            fetchWallet: async () => {
                const { user } = get()
                if (!user) return

                const { data, error } = await supabase
                    .from('megabucks_wallets')
                    .select('*')
                    .eq('user_id', user.id)
                    .single()

                if (!error && data) {
                    set({ wallet: data as MegaBucksWallet })
                }
            },

            // Fetch current user's MegaScore
            fetchMegaScore: async () => {
                const { user } = get()
                if (!user) return

                const { data, error } = await supabase
                    .from('megascores')
                    .select('*')
                    .eq('user_id', user.id)
                    .single()

                if (!error && data) {
                    set({ megaScore: data as MegaScore })
                }
            },

            // Sign up new user
            signUp: async (email, password, username, visaId) => {
                set({ isLoading: true })

                try {
                    // Check if username is available
                    const { data: existingUser } = await supabase
                        .from('profiles')
                        .select('username')
                        .eq('username', username.toLowerCase())
                        .single()

                    if (existingUser) {
                        throw new Error('Username is already taken')
                    }

                    // Create auth user
                    const { data, error } = await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            data: {
                                username: username.toLowerCase(),
                            },
                        },
                    })

                    if (error) throw error
                    if (!data.user) throw new Error('Failed to create account')

                    // Try to create profile (may fail due to RLS, trigger will handle it)
                    const { error: profileError } = await supabase.from('profiles').insert({
                        id: data.user.id,
                        username: username.toLowerCase(),
                        display_name: username,
                        is_private: false,
                        show_email: false,
                        show_phone: false,
                        show_location: true,
                        is_verified: false,
                        is_active: true,
                        is_banned: false,
                    })

                    if (profileError) {
                        console.warn('Profile creation via client failed (will use DB trigger):', profileError)
                        // Don't throw - the database trigger should handle this
                    }

                    // Create MegaBucks wallet
                    const { error: walletError } = await supabase.from('megabucks_wallets').insert({
                        user_id: data.user.id,
                        balance: 0,
                        total_earned: 0,
                        total_spent: 0,
                        total_withdrawn: 0,
                        is_frozen: false,
                    })

                    if (walletError) {
                        console.error('Wallet creation error:', walletError)
                    }

                    // Create initial MegaScore
                    const { error: scoreError } = await supabase.from('megascores').insert({
                        user_id: data.user.id,
                        total_score: 0,
                        level: 1,
                        content_score: 0,
                        engagement_score: 0,
                        community_score: 0,
                        economic_score: 0,
                        trust_score: 0,
                    })

                    if (scoreError) {
                        console.error('MegaScore creation error:', scoreError)
                    }

                    // Create user_visas entry if visaId provided
                    if (visaId) {
                        const { error: visaError } = await supabase.from('user_visas').insert({
                            user_id: data.user.id,
                            visa_id: visaId,
                            status: 'active',
                            purchase_price_paid: 0, // Free during registration
                        })

                        if (visaError) {
                            console.error('User VISA creation error:', visaError)
                        } else {
                            // ========================================================
                            // 🎯 AUTOMATIC MATRIX PLACEMENT
                            // ========================================================
                            // Place user in matrix immediately after VISA assignment
                            // Get referrer_id from URL params if available
                            const urlParams = new URLSearchParams(window.location.search)
                            const referrerUsername = urlParams.get('ref')

                            let referrerId = null
                            if (referrerUsername) {
                                // Look up referrer by username
                                const { data: referrerData } = await supabase
                                    .from('profiles')
                                    .select('id')
                                    .eq('username', referrerUsername.toLowerCase())
                                    .single()

                                if (referrerData) {
                                    referrerId = referrerData.id
                                    console.log(`✅ Referrer found: ${referrerUsername} (${referrerId})`)
                                } else {
                                    console.warn(`⚠️  Referrer '${referrerUsername}' not found - placing as orphan`)
                                }
                            }

                            // Call the database function to place user in matrix
                            const { data: matrixResult, error: matrixError } = await supabase.rpc(
                                'place_user_in_matrix',
                                {
                                    p_user_id: data.user.id,
                                    p_visa_id: visaId,
                                    p_referrer_user_id: referrerId
                                }
                            )

                            if (matrixError) {
                                console.error('❌ Matrix placement failed:', matrixError)
                            } else {
                                console.log(`✅ User placed in matrix! Position ID: ${matrixResult}`)
                            }
                        }
                    }

                    set({ user: data.user, session: data.session })
                    await get().fetchProfile()
                    await get().fetchWallet()
                } finally {
                    set({ isLoading: false })
                }
            },

            // Sign in existing user
            signIn: async (email, password) => {
                set({ isLoading: true })

                try {
                    const { data, error } = await supabase.auth.signInWithPassword({
                        email,
                        password,
                    })

                    if (error) throw error

                    set({ user: data.user, session: data.session })
                    await get().fetchProfile()
                    await get().fetchWallet()
                    await get().fetchMegaScore()
                } finally {
                    set({ isLoading: false })
                }
            },

            // Sign out
            signOut: async () => {
                await supabase.auth.signOut()
                set({
                    user: null,
                    session: null,
                    profile: null,
                    wallet: null,
                    megaScore: null,
                })
            },

            // Update profile
            updateProfile: async (updates) => {
                const { user, profile } = get()
                if (!user || !profile) return

                const { data, error } = await supabase
                    .from('profiles')
                    .update(updates)
                    .eq('id', user.id)
                    .select()
                    .single()

                if (error) throw error
                set({ profile: data as Profile })
            },
        }),
        {
            name: 'megavx-auth',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                // Only persist non-sensitive data
                profile: state.profile,
            }),
        }
    )
)

// Selector hooks for convenience
export const useUser = () => useAuthStore((state) => state.user)
export const useProfile = () => useAuthStore((state) => state.profile)
export const useWallet = () => useAuthStore((state) => state.wallet)
export const useMegaScore = () => useAuthStore((state) => state.megaScore)
export const useIsAuthenticated = () => useAuthStore((state) => !!state.user)
