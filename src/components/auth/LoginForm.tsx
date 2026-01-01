import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/stores/uiStore'

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

interface LoginFormProps {
    onSuccess?: () => void
    onSwitchToRegister?: () => void
    onForgotPassword?: () => void
}

export function LoginForm({ onSuccess, onSwitchToRegister, onForgotPassword }: LoginFormProps) {
    const [showPassword, setShowPassword] = useState(false)
    const signIn = useAuthStore((state) => state.signIn)
    const toast = useToast()

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginFormData) => {
        try {
            await signIn(data.email, data.password)
            toast.success('Welcome back!', 'You are now signed in')
            onSuccess?.()
        } catch (error) {
            toast.error('Login failed', error instanceof Error ? error.message : 'Invalid email or password')
        }
    }

    return (
        <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2" style={{ color: '#f5f5f5' }}>Welcome Back</h1>
                <p style={{ color: '#888888' }}>Sign in to continue to MegaVX World</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                    label="Email"
                    type="email"
                    placeholder="Enter your email"
                    leftIcon={<Mail size={18} />}
                    error={errors.email?.message}
                    {...register('email')}
                />

                <div>
                    <Input
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
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
                    {onForgotPassword && (
                        <button
                            type="button"
                            onClick={onForgotPassword}
                            className="mt-2 text-sm text-primary-600 hover:text-primary-700"
                        >
                            Forgot password?
                        </button>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    isLoading={isSubmitting}
                >
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>
            </form>

            {/* Social login divider */}
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full" style={{ borderTop: '1px solid #333333' }} />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4" style={{ backgroundColor: '#121212', color: '#888888' }}>Or continue with</span>
                </div>
            </div>

            {/* Social login buttons */}
            <div className="grid grid-cols-2 gap-3">
                <Button variant="secondary" className="w-full">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Google
                </Button>
                <Button variant="secondary" className="w-full">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                </Button>
            </div>

            {/* Switch to register */}
            <p className="mt-6 text-center" style={{ color: '#888888' }}>
                Don't have an account?{' '}
                <button
                    type="button"
                    onClick={onSwitchToRegister}
                    className="font-semibold hover:underline"
                    style={{ color: '#d4af37' }}
                >
                    Sign up
                </button>
            </p>
        </div>
    )
}
