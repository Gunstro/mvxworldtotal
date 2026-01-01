import { useState } from 'react'
import { Navigate, useNavigate, Link } from 'react-router-dom'
import { LoginForm, RegisterForm } from '@/components/auth'
import { useIsAuthenticated } from '@/stores/authStore'

export function AuthPage() {
    const [mode, setMode] = useState<'login' | 'register'>('login')
    const isAuthenticated = useIsAuthenticated()
    const navigate = useNavigate()

    // Redirect if already authenticated
    if (isAuthenticated) {
        return <Navigate to="/" replace />
    }

    const handleSuccess = () => {
        navigate('/')
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 lg:p-8"
            style={{ backgroundColor: '#0a0a0a' }}
        >
            {/* Centered Container */}
            <div
                className="w-full max-w-5xl flex flex-col lg:flex-row rounded-3xl overflow-hidden shadow-2xl"
                style={{ border: '1px solid #2a2a2a' }}
            >
                {/* Left Panel - Branding */}
                <div
                    className="lg:w-1/2 p-8 lg:p-10 relative overflow-hidden flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)' }}
                >
                    {/* Gold accent line on right edge */}
                    <div
                        className="absolute top-0 right-0 w-1 h-full hidden lg:block"
                        style={{ background: 'linear-gradient(to bottom, transparent, #d4af37, transparent)' }}
                    />

                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                            }}
                        />
                    </div>

                    {/* Content - Centered */}
                    <div className="relative z-10 text-center">
                        {/* Logo */}
                        <div className="flex items-center gap-3 mb-8">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center"
                                style={{ background: 'linear-gradient(to bottom right, #d4af37, #c9a227)' }}
                            >
                                <span className="font-bold text-2xl" style={{ color: '#0a0a0a' }}>M</span>
                            </div>
                            <span
                                className="text-2xl lg:text-3xl font-bold"
                                style={{ background: 'linear-gradient(to right, #d4af37, #f4cf47)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                            >
                                MegaVX World
                            </span>
                        </div>

                        {/* Main content */}
                        <div>
                            <h1 className="text-2xl lg:text-4xl font-bold mb-4 leading-tight" style={{ color: '#f5f5f5' }}>
                                Your Social Network,{' '}
                                <span style={{ color: '#d4af37' }}>Your Economy</span>
                            </h1>
                            <p className="text-base lg:text-lg mb-6" style={{ color: '#aaaaaa' }}>
                                Join the revolution where every interaction earns you real value.
                            </p>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div>
                                    <div className="text-xl lg:text-2xl font-bold" style={{ color: '#f5f5f5' }}>10M+</div>
                                    <div className="text-xs" style={{ color: '#888888' }}>Active Users</div>
                                </div>
                                <div>
                                    <div className="text-xl lg:text-2xl font-bold" style={{ color: '#d4af37' }}>AF 5M+</div>
                                    <div className="text-xs" style={{ color: '#888888' }}>Earned Monthly</div>
                                </div>
                                <div>
                                    <div className="text-xl lg:text-2xl font-bold" style={{ color: '#f5f5f5' }}>50K+</div>
                                    <div className="text-xs" style={{ color: '#888888' }}>Communities</div>
                                </div>
                            </div>

                            {/* Learn More Link */}
                            <Link
                                to="/about"
                                className="inline-flex items-center justify-center gap-2 font-medium hover:underline transition-all text-sm"
                                style={{ color: '#d4af37' }}
                            >
                                Get to know more! →
                            </Link>
                        </div>

                        {/* Testimonial - desktop only */}
                        <div
                            className="hidden lg:block mt-6 rounded-xl p-4 w-full"
                            style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.2)' }}
                        >
                            <p className="text-sm mb-3" style={{ color: '#cccccc' }}>
                                "MegaVX World changed how I think about social media. I'm not just
                                posting - I'm building wealth."
                            </p>
                            <div className="flex items-center justify-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: '#d4af37' }}
                                >
                                    <span className="text-sm" style={{ color: '#0a0a0a', fontWeight: 'bold' }}>G</span>
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>Gunnar</div>
                                    <div className="text-xs" style={{ color: '#d4af37' }}>
                                        Top Earner - AF 2,400/month
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Auth Form */}
                <div
                    className="lg:w-1/2 p-8 lg:p-10"
                    style={{ backgroundColor: '#121212' }}
                >
                    <div className="h-full flex flex-col justify-center items-center">
                        <div className="w-full max-w-sm">
                            {mode === 'login' ? (
                                <LoginForm
                                    onSuccess={handleSuccess}
                                    onSwitchToRegister={() => setMode('register')}
                                />
                            ) : (
                                <RegisterForm
                                    onSuccess={handleSuccess}
                                    onSwitchToLogin={() => setMode('login')}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
