import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, User, Eye, EyeOff, Globe, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/stores/uiStore'
import { supabase } from '@/lib/supabase'

// VISA type from database
interface Visa {
    id: string
    visa_type: string
    category: string
    v_no: number
    price: string
    monthly_fee: string
    income_cap: string
    level: number
    available: boolean
    availability_limit: number | null
    positions_allocated: number
    lifetime: boolean
    upgradeable: boolean
    shares: number
    description: string
    badge_color: string
    is_active: boolean
}

const registerSchema = z.object({
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be less than 20 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: z.string().email('Please enter a valid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
    visaId: z.string().min(1, 'Please select a VISA type'),
    acceptTerms: z.boolean().refine((val) => val === true, {
        message: 'You must accept the Terms & Conditions to continue',
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

interface RegisterFormProps {
    onSuccess?: () => void
    onSwitchToLogin?: () => void
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [selectedVisa, setSelectedVisa] = useState('')
    const [visas, setVisas] = useState<Visa[]>([])
    const [loadingVisas, setLoadingVisas] = useState(true)
    const signUp = useAuthStore((state) => state.signUp)
    const toast = useToast()

    // Fetch visas from database
    useEffect(() => {
        async function fetchVisas() {
            const { data, error } = await supabase
                .from('visas')
                .select('*')
                .eq('is_active', true)
                .eq('available', true)
                .order('v_no', { ascending: true })

            if (error) {
                console.error('Error fetching visas:', error)
                toast.error('Failed to load VISA options')
            } else {
                setVisas(data || [])
            }
            setLoadingVisas(false)
        }
        fetchVisas()
    }, [])

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        mode: 'onChange', // Show errors as user types
    })

    // Debug: log validation errors with details
    if (Object.keys(errors).length > 0) {
        console.log('Form has errors:', Object.keys(errors))
        Object.keys(errors).forEach(field => {
            console.log(`  ${field}:`, errors[field as keyof typeof errors]?.message)
        })
    }

    const onSubmit = async (data: RegisterFormData) => {
        try {
            console.log('🚀 Starting registration with data:', {
                email: data.email,
                username: data.username,
                visaId: data.visaId
            })

            await signUp(data.email, data.password, data.username, data.visaId)

            console.log('✅ Registration successful!')
            toast.success('Account created!', 'Welcome to MegaVX')
            onSuccess?.()
        } catch (error) {
            console.error('❌ Registration failed with error:', error)
            console.error('Error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                fullError: error
            })
            toast.error('Registration failed', error instanceof Error ? error.message : 'Please try again')
        }
    }

    return (
        <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2" style={{ color: '#f5f5f5' }}>Join MegaVX World</h1>
                <p style={{ color: '#888888' }}>Create your account and start earning</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                    label="Username"
                    placeholder="yourname (no @ needed)"
                    leftIcon={<User size={18} />}
                    error={errors.username?.message}
                    {...register('username')}
                />

                <Input
                    label="Email"
                    type="email"
                    placeholder="Enter your email"
                    leftIcon={<Mail size={18} />}
                    error={errors.email?.message}
                    {...register('email')}
                />

                <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    leftIcon={<Lock size={18} />}
                    rightIcon={
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="focus:outline-none"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    }
                    error={errors.password?.message}
                    {...register('password')}
                />

                <Input
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    leftIcon={<Lock size={18} />}
                    rightIcon={
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="focus:outline-none"
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    }
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                />

                {/* VISA Type Selection */}
                <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: '#cccccc' }}>
                        <Globe size={16} className="inline mr-2" />
                        Choose Your VISA Membership
                    </label>

                    {loadingVisas ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#d4af37' }} />
                            <span className="ml-2" style={{ color: '#888888' }}>Loading VISA options...</span>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                            {visas.map((visa) => {
                                const badgeColors: Record<string, string> = {
                                    gold: '#d4af37',
                                    purple: '#9333ea',
                                    amber: '#f59e0b',
                                    blue: '#3b82f6',
                                    indigo: '#6366f1',
                                    teal: '#14b8a6',
                                    green: '#22c55e',
                                    cyan: '#06b6d4',
                                    gray: '#6b7280',
                                    slate: '#64748b',
                                }
                                const color = badgeColors[visa.badge_color] || '#888888'
                                const isFree = parseFloat(visa.price) === 0
                                const isLifetime = visa.lifetime

                                return (
                                    <label
                                        key={visa.id}
                                        className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all"
                                        style={{
                                            backgroundColor: selectedVisa === visa.id ? 'rgba(212, 175, 55, 0.15)' : '#1a1a1a',
                                            border: selectedVisa === visa.id ? '2px solid #d4af37' : '1px solid #333333',
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            value={visa.id}
                                            {...register('visaId')}
                                            onChange={(e) => {
                                                setSelectedVisa(e.target.value)
                                                setValue('visaId', e.target.value)
                                            }}
                                            className="mt-1 w-4 h-4"
                                            style={{ accentColor: '#d4af37' }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium" style={{ color }}>
                                                    {visa.visa_type}
                                                </span>
                                                {isLifetime && (
                                                    <span
                                                        className="px-1.5 py-0.5 text-xs rounded"
                                                        style={{ backgroundColor: color, color: '#0a0a0a' }}
                                                    >
                                                        LIFETIME
                                                    </span>
                                                )}
                                                {visa.v_no === 1 && (
                                                    <span
                                                        className="px-1.5 py-0.5 text-xs rounded"
                                                        style={{ backgroundColor: '#d4af37', color: '#0a0a0a' }}
                                                    >
                                                        FOUNDER
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs mt-1" style={{ color: '#888888' }}>
                                                {visa.description}
                                            </div>
                                            <div className="flex items-center gap-3 mt-2 text-xs">
                                                <span style={{ color: isFree ? '#22c55e' : '#f5f5f5' }}>
                                                    {isFree ? 'FREE' : `£${parseFloat(visa.price).toLocaleString('en-GB')}`}
                                                </span>
                                                {!isLifetime && parseFloat(visa.monthly_fee) > 0 && (
                                                    <span style={{ color: '#666666' }}>
                                                        +£{parseFloat(visa.monthly_fee).toLocaleString('en-GB')}/mo
                                                    </span>
                                                )}
                                                <span style={{ color: '#d4af37' }}>
                                                    Cap: £{parseFloat(visa.income_cap).toLocaleString('en-GB')}
                                                </span>
                                                {visa.shares > 0 && (
                                                    <span style={{ color: '#9333ea' }}>
                                                        {visa.shares} shares
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </label>
                                )
                            })}
                        </div>
                    )}

                    {errors.visaId && (
                        <p className="mt-2 text-sm" style={{ color: '#ef4444' }}>{errors.visaId.message}</p>
                    )}
                </div>

                {/* Terms & Conditions Checkbox */}
                <div className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        id="acceptTerms"
                        {...register('acceptTerms')}
                        className="mt-1 w-4 h-4 rounded border-gray-600 accent-yellow-500 focus:ring-yellow-500"
                        style={{ accentColor: '#d4af37' }}
                    />
                    <label htmlFor="acceptTerms" className="text-sm" style={{ color: '#aaaaaa' }}>
                        I agree to the{' '}
                        <Link to="/terms" className="font-medium hover:underline" style={{ color: '#d4af37' }}>
                            Terms & Conditions
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="font-medium hover:underline" style={{ color: '#d4af37' }}>
                            Privacy Policy
                        </Link>
                    </label>
                </div>
                {errors.acceptTerms && (
                    <p className="text-sm" style={{ color: '#ef4444' }}>{errors.acceptTerms.message}</p>
                )}

                <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    isLoading={isSubmitting}
                >
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </Button>
            </form>

            {/* Welcome Bonus */}
            <div
                className="mt-6 p-4 rounded-xl"
                style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)' }}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: 'linear-gradient(to bottom right, #d4af37, #c9a227)' }}
                    >
                        <span className="font-bold" style={{ color: '#0a0a0a' }}>MB</span>
                    </div>
                    <div>
                        <p className="font-semibold" style={{ color: '#d4af37' }}>🎉 Welcome Bonus</p>
                        <p className="text-sm" style={{ color: '#aaaaaa' }}>
                            Complete your profile to earn 50 MegaBucks!
                        </p>
                    </div>
                </div>
            </div>

            {/* Switch to login */}
            <p className="mt-6 text-center" style={{ color: '#888888' }}>
                Already have an account?{' '}
                <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="font-semibold hover:underline"
                    style={{ color: '#d4af37' }}
                >
                    Sign in
                </button>
            </p>
        </div>
    )
}
