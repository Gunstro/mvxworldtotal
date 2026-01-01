import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, Bell, MessageCircle, Menu, X, Plus, LogOut, Shield, Home } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { useProfile, useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'

export function Header() {
    const [searchQuery, setSearchQuery] = useState('')
    const profile = useProfile()
    const signOut = useAuthStore((state) => state.signOut)
    const navigate = useNavigate()
    const location = useLocation()
    const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore()

    const isAdminArea = location.pathname.startsWith('/admin')

    const handleLogout = async () => {
        await signOut()
        navigate('/auth')
    }

    return (
        <header className="sticky top-0 z-40 backdrop-blur-lg border-b"
            style={{ backgroundColor: 'rgba(18, 18, 18, 0.9)', borderColor: '#2a2a2a' }}>
            <div className="flex items-center justify-between h-16 px-4 lg:px-6">
                {/* Mobile menu button */}
                <button
                    className="lg:hidden p-2 -ml-2 rounded-lg"
                    style={{ color: '#f5f5f5' }}
                    onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Logo for mobile */}
                <Link to="/" className="lg:hidden flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'linear-gradient(to bottom right, #d4af37, #c9a227)' }}>
                        <span className="font-bold" style={{ color: '#0a0a0a' }}>M</span>
                    </div>
                </Link>

                {/* Search bar */}
                <div className="hidden md:flex flex-1 max-w-xl mx-4">
                    <div className="relative w-full">
                        <Search
                            className="absolute left-4 top-1/2 -translate-y-1/2"
                            size={18}
                            style={{ color: '#888888' }}
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search MegaVX..."
                            className="w-full pl-11 pr-4 py-2.5 rounded-xl transition-all duration-200"
                            style={{
                                backgroundColor: '#1a1a1a',
                                border: '1px solid #333333',
                                color: '#f5f5f5',
                            }}
                        />
                    </div>
                </div>

                {/* Right side actions */}
                <div className="flex items-center gap-2">
                    {/* Admin/Member Toggle Button - Only for admins */}
                    {profile?.is_admin && (
                        isAdminArea ? (
                            <Link
                                to="/"
                                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
                                style={{
                                    backgroundColor: '#22c55e20',
                                    color: '#22c55e',
                                    border: '1px solid #22c55e40'
                                }}
                                title="Back to Member Area"
                            >
                                <Home size={18} />
                                <span className="hidden sm:inline text-sm font-medium">Member</span>
                            </Link>
                        ) : (
                            <Link
                                to="/admin"
                                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
                                style={{
                                    backgroundColor: '#dc262620',
                                    color: '#dc2626',
                                    border: '1px solid #dc262640'
                                }}
                                title="Admin Dashboard"
                            >
                                <Shield size={18} />
                                <span className="hidden sm:inline text-sm font-medium">Admin</span>
                            </Link>
                        )
                    )}

                    {/* Create post button */}
                    <Button
                        size="sm"
                        className="hidden sm:flex"
                        leftIcon={<Plus size={18} />}
                    >
                        Create
                    </Button>

                    {/* Notification button */}
                    <Link
                        to="/notifications"
                        className="relative p-2.5 rounded-xl hover:bg-surface-100 transition-colors"
                    >
                        <Bell size={22} className="text-surface-600" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full" />
                    </Link>

                    {/* Messages button */}
                    <Link
                        to="/messages"
                        className="relative p-2.5 rounded-xl hover:bg-surface-100 transition-colors"
                    >
                        <MessageCircle size={22} className="text-surface-600" />
                        <span className="absolute -top-px -right-px px-1.5 text-xs font-semibold bg-primary-500 text-white rounded-full">
                            3
                        </span>
                    </Link>

                    {/* Profile dropdown */}
                    <Link
                        to={`/profile/${profile?.username}`}
                        className="hidden sm:block"
                    >
                        <Avatar src={profile?.avatar_url} size="sm" isOnline />
                    </Link>

                    {/* Logout button */}
                    <button
                        onClick={handleLogout}
                        className="p-2.5 rounded-xl hover:bg-red-50 text-surface-600 hover:text-red-600 transition-colors"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            {/* Mobile search - shown below header when expanded */}
            <div className="md:hidden px-4 pb-3">
                <div className="relative w-full">
                    <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400"
                        size={18}
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search MegaVX..."
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl 
                     bg-surface-100 border border-transparent
                     text-surface-900 placeholder-surface-400
                     focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-500/20
                     transition-all duration-200"
                    />
                </div>
            </div>
        </header>
    )
}
