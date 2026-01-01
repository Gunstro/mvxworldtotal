import { Link, useLocation } from 'react-router-dom'

import {
    Home,
    Search,
    Bell,
    MessageCircle,
    Users,
    Store,
    Briefcase,
    Newspaper,
    Gamepad2,
    Settings,
    Coins,
    TrendingUp,
    Crown,
    ChevronRight,
    Network,
    Shield,
    LayoutDashboard,
    Radio,
    PiggyBank,
    Upload,
    BarChart3,
    Wallet,
    Bluetooth,
    Image,
    Bookmark,
    Clock,
    Hand,
    Edit3,
    UserPlus,
    Heart,
    Tag,
    DollarSign,
    Calendar,
    Map,
    Trophy,
    MessageSquare
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { useProfile, useWallet } from '@/stores/authStore'

interface NavItem {
    icon: React.ElementType
    label: string
    path: string
    badge?: number | string
}

// Main Navigation
const mainNavItems: NavItem[] = [
    { icon: Home, label: 'News Feed', path: '/' },
    { icon: Search, label: 'Explore', path: '/explore' },
    { icon: Network, label: 'This is Me!', path: '/business' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
]

// Social Features
const socialNavItems: NavItem[] = [
    { icon: Image, label: 'Albums', path: '/albums' },
    { icon: Bookmark, label: 'Saved Posts', path: '/saved' },
    { icon: TrendingUp, label: 'Popular Posts', path: '/popular' },
    { icon: Clock, label: 'Memories', path: '/memories' },
    { icon: Hand, label: 'Pokes', path: '/pokes' },
]

// Community
const communityNavItems: NavItem[] = [
    { icon: Users, label: 'My Groups', path: '/groups' },
    { icon: Newspaper, label: 'My Pages', path: '/pages' },
]

// Content Creation
const contentNavItems: NavItem[] = [
    { icon: Edit3, label: 'Blog', path: '/blog' },
    { icon: MessageSquare, label: 'Forum', path: '/forum' },
]

// Marketplace & Economy
const marketplaceNavItems: NavItem[] = [
    { icon: Store, label: 'Market', path: '/market' },
    { icon: Briefcase, label: 'Jobs', path: '/jobs' },
    { icon: Tag, label: 'Offers', path: '/offers' },
    { icon: DollarSign, label: 'Fundings', path: '/fundings' },
]

// Events & Activities
const eventsNavItems: NavItem[] = [
    { icon: Calendar, label: 'Events', path: '/events' },
    { icon: Gamepad2, label: 'Citizen Game', path: '/citizen-game', badge: 'NEW' },
]

// Discovery
const discoveryNavItems: NavItem[] = [
    { icon: UserPlus, label: 'Find Friends', path: '/find-friends' },
    { icon: Heart, label: 'Common Things', path: '/common' },
]

// Territory & Monetization
const monetizationNavItems: NavItem[] = [
    { icon: Map, label: 'Territories', path: '/territory', badge: 'NEW' },
    { icon: Radio, label: 'My Beacons', path: '/beacons' },
    { icon: Trophy, label: 'Achievements', path: '/achievements' },
]

// Admin navigation items - Each gets its own page
const adminNavItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'User Management', path: '/admin/users' },
    { icon: Network, label: 'Matrix Management', path: '/admin/matrix' },
    { icon: Radio, label: 'MDP Management', path: '/admin/mdp' },
    { icon: Wallet, label: 'Wallet Manager', path: '/admin/wallets' },
    { icon: PiggyBank, label: 'Platform Funds', path: '/admin/funds' },
]

const adminToolsItems: NavItem[] = [
    { icon: Upload, label: 'Import Founders', path: '/admin/import-founders' },
    { icon: Bluetooth, label: 'Register MDP', path: '/mdp/register' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
]

export function Sidebar() {
    const location = useLocation()
    const profile = useProfile()
    const wallet = useWallet()

    const isAdminArea = location.pathname.startsWith('/admin')

    const NavLink = ({ item }: { item: NavItem }) => {
        const isActive = location.pathname === item.path
        const Icon = item.icon

        return (
            <Link
                to={item.path}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                style={{
                    backgroundColor: isActive ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                    color: '#cccccc',
                    fontWeight: 500,
                    borderLeft: isActive ? '3px solid #d4af37' : '3px solid transparent',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)'
                    e.currentTarget.style.color = '#d4af37'
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isActive ? 'rgba(212, 175, 55, 0.1)' : 'transparent'
                    e.currentTarget.style.color = '#cccccc'
                }}
            >
                <Icon size={22} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full"
                        style={{ backgroundColor: '#d4af37', color: '#0a0a0a' }}>
                        {item.badge}
                    </span>
                )}
            </Link>
        )
    }

    return (
        <aside className="w-72 h-screen flex flex-col border-r"
            style={{ backgroundColor: '#121212', borderColor: '#2a2a2a' }}>
            {/* Logo */}
            <div className="p-6 flex-shrink-0">
                <Link to={isAdminArea ? '/admin' : '/'} className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                            background: isAdminArea
                                ? 'linear-gradient(to bottom right, #dc2626, #991b1b)'
                                : 'linear-gradient(to bottom right, #d4af37, #c9a227)'
                        }}>
                        <span className="font-bold text-xl" style={{ color: isAdminArea ? 'white' : '#0a0a0a' }}>
                            {isAdminArea ? 'A' : 'M'}
                        </span>
                    </div>
                    <span className="text-2xl font-bold"
                        style={{
                            background: isAdminArea
                                ? 'linear-gradient(to right, #dc2626, #ef4444)'
                                : 'linear-gradient(to right, #d4af37, #f4cf47)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                        {isAdminArea ? 'Admin Panel' : 'MegaVX World'}
                    </span>
                </Link>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto scrollbar-thin"
                style={{ display: 'block' }}>

                {isAdminArea ? (
                    /* ADMIN NAVIGATION */
                    <nav className="px-3">
                        {/* Admin Stats Card */}
                        <div className="px-1 mb-4">
                            <div className="p-4 rounded-xl"
                                style={{ background: 'linear-gradient(to bottom right, #dc2626, #991b1b)' }}>
                                <div className="flex items-center gap-2 mb-2 text-white">
                                    <Shield size={18} />
                                    <span className="text-sm font-medium opacity-90">Admin Mode</span>
                                </div>
                                <div className="text-lg font-bold text-white mb-1">
                                    System Management
                                </div>
                                <div className="text-sm text-white/70">
                                    Manage users, matrix & MDPs
                                </div>
                            </div>
                        </div>

                        {/* Admin Navigation */}
                        <div className="space-y-1">
                            {adminNavItems.map((item) => (
                                <NavLink key={item.path + item.label} item={item} />
                            ))}
                        </div>

                        {/* Admin Tools Section */}
                        <div className="mt-6">
                            <p className="px-4 mb-2 text-xs font-semibold text-surface-400 uppercase tracking-wider">
                                Tools
                            </p>
                            <div className="space-y-1">
                                {adminToolsItems.map((item) => (
                                    <NavLink key={item.path + item.label} item={item} />
                                ))}
                            </div>
                        </div>

                        {/* Back to Member Area */}
                        <div className="mt-6 px-1">
                            <Link
                                to="/"
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium transition-all"
                                style={{
                                    backgroundColor: '#22c55e20',
                                    color: '#22c55e',
                                    border: '1px solid #22c55e40'
                                }}
                            >
                                <Home size={18} />
                                Back to Member Area
                            </Link>
                        </div>
                    </nav>
                ) : (
                    /* MEMBER NAVIGATION */
                    <>
                        {/* MegaBucks Card */}
                        <div className="px-4 mb-4">
                            <div className="p-4 rounded-xl text-white"
                                style={{ background: 'linear-gradient(to bottom right, #fbbf24, #f59e0b)' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Coins size={18} />
                                    <span className="text-sm font-medium opacity-90">MegaBucks/MegaBillions</span>
                                </div>
                                <div className="text-2xl font-bold mb-3">
                                    {wallet?.balance?.toFixed(2) || '0.00'} MB
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-1">
                                        <TrendingUp size={14} />
                                        <span className="opacity-90">+12.5% this week</span>
                                    </div>
                                    <Link
                                        to="/wallet"
                                        className="flex items-center gap-1 font-medium hover:underline"
                                    >
                                        View <ChevronRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Main Navigation */}
                        <nav className="px-3">
                            <div className="space-y-1">
                                {mainNavItems.map((item) => (
                                    <NavLink key={item.path} item={item} />
                                ))}
                            </div>

                            {/* Community Section */}
                            <div className="mt-6">
                                <p className="px-4 mb-2 text-xs font-semibold text-surface-400 uppercase tracking-wider">
                                    Community
                                </p>
                                <div className="space-y-1">
                                    {communityNavItems.map((item) => (
                                        <NavLink key={item.path} item={item} />
                                    ))}
                                </div>
                            </div>

                            {/* Social Features Section */}
                            <div className="mt-6">
                                <p className="px-4 mb-2 text-xs font-semibold text-surface-400 uppercase tracking-wider">
                                    Social
                                </p>
                                <div className="space-y-1">
                                    {socialNavItems.map((item) => (
                                        <NavLink key={item.path} item={item} />
                                    ))}
                                </div>
                            </div>

                            {/* Content Creation Section */}
                            <div className="mt-6">
                                <p className="px-4 mb-2 text-xs font-semibold text-surface-400 uppercase tracking-wider">
                                    Create Content
                                </p>
                                <div className="space-y-1">
                                    {contentNavItems.map((item) => (
                                        <NavLink key={item.path} item={item} />
                                    ))}
                                </div>
                            </div>

                            {/* Marketplace & Economy Section */}
                            <div className="mt-6">
                                <p className="px-4 mb-2 text-xs font-semibold text-surface-400 uppercase tracking-wider">
                                    Marketplace
                                </p>
                                <div className="space-y-1">
                                    {marketplaceNavItems.map((item) => (
                                        <NavLink key={item.path} item={item} />
                                    ))}
                                </div>
                            </div>

                            {/* Events & Activities Section */}
                            <div className="mt-6">
                                <p className="px-4 mb-2 text-xs font-semibold text-surface-400 uppercase tracking-wider">
                                    Events & Fun
                                </p>
                                <div className="space-y-1">
                                    {eventsNavItems.map((item) => (
                                        <NavLink key={item.path} item={item} />
                                    ))}
                                </div>
                            </div>

                            {/* Discovery Section */}
                            <div className="mt-6">
                                <p className="px-4 mb-2 text-xs font-semibold text-surface-400 uppercase tracking-wider">
                                    Connect
                                </p>
                                <div className="space-y-1">
                                    {discoveryNavItems.map((item) => (
                                        <NavLink key={item.path} item={item} />
                                    ))}
                                </div>
                            </div>

                            {/* Territory & Monetization Section */}
                            <div className="mt-6">
                                <p className="px-4 mb-2 text-xs font-semibold text-surface-400 uppercase tracking-wider">
                                    Earn & Build
                                </p>
                                <div className="space-y-1">
                                    {monetizationNavItems.map((item) => (
                                        <NavLink key={item.path} item={item} />
                                    ))}
                                </div>
                            </div>

                            {/* Pro Section */}
                            <div className="mt-6 px-4 pb-4">
                                <div className="p-4 rounded-xl bg-gradient-to-br from-secondary-50 to-primary-50 border border-primary-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Crown className="text-secondary-500" size={20} />
                                        <span className="font-semibold text-surface-900">Go Pro</span>
                                    </div>
                                    <p className="text-sm text-surface-600 mb-3">
                                        Unlock Premium Features
                                        Increase earnings, verified badges, and more!
                                    </p>
                                    <Link
                                        to="/pro"
                                        className="block w-full py-2 text-center text-sm font-semibold
                       bg-gradient-to-r from-secondary-500 to-primary-500 
                       text-white rounded-lg hover:opacity-90 transition-opacity"
                                    >
                                        Upgrade Now
                                    </Link>
                                </div>
                            </div>
                        </nav>
                    </>
                )}
            </div>

            {/* User Profile Section - Fixed at bottom */}
            <div className="p-4 border-t flex-shrink-0" style={{ backgroundColor: '#121212', borderColor: '#2a2a2a' }}>
                <Link
                    to={profile?.username ? `/profile/${profile.username}` : '/settings'}
                    className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                    style={{ backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <Avatar src={profile?.avatar_url} size="md" isOnline />
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate" style={{ color: '#f5f5f5 !important' }}>
                            {profile?.display_name || profile?.username || 'Complete Your Profile'}
                        </p>
                        <p className="text-sm truncate" style={{ color: '#d4af37 !important' }}>
                            {profile?.username ? `@${profile.username}` : 'Click to set up'}
                        </p>
                    </div>
                    <Settings
                        size={18}
                        style={{ color: '#888888' }}
                    />
                </Link>
            </div>
        </aside>
    )
}
