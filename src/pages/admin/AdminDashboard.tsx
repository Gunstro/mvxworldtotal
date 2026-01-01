// ============================================================================
// SUPER ADMIN DASHBOARD
// ============================================================================
// View all users, matrix positions, wallets, platform funds, and system stats
// ============================================================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    Users,
    Crown,
    Wallet,
    Network,
    DollarSign,
    RefreshCw,
    Search,
    Eye,
    Shield,
    PiggyBank,
    Coins,
    UserPlus,
    BarChart3,
    ArrowUp,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { GenealogyTreeView } from '@/components/admin/GenealogyTreeView'

interface SystemStats {
    totalUsers: number
    totalFounders: number
    totalPremiere: number
    totalStandard: number
    totalOpenSpots: number
    totalWallets: number
    totalAfroInCirculation: number
    totalMegabucksInCirculation: number
    povertyFundBalance: number
    mbBackingBalance: number
    operatingBalance: number
}

interface UserRow {
    id: string
    email: string
    full_name: string
    username: string
    matrix_level: number
    visa_type: string
    badge_color: string
    afro_available: number
    megabucks_balance: number
    children_count: number
    readable_position: string | null
    is_legacy_founder: boolean
    created_at: string
}

export function AdminDashboard() {
    const [stats, setStats] = useState<SystemStats | null>(null)
    const [users, setUsers] = useState<UserRow[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterLevel, setFilterLevel] = useState<number | null>(null)
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'matrix' | 'genealogy' | 'funds'>('overview')

    // Fetch all data
    const fetchData = async () => {
        setIsLoading(true)
        try {
            // Fetch total users from profiles table
            const { count: totalUsers } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })

            // Get matrix stats by DEPTH (pyramid level)
            const { count: foundersCount } = await supabase
                .from('matrix_positions')
                .select('*', { count: 'exact', head: true })
                .eq('depth', 1)

            const { count: premiereCount } = await supabase
                .from('matrix_positions')
                .select('*', { count: 'exact', head: true })
                .eq('depth', 2)

            const { count: standardCount } = await supabase
                .from('matrix_positions')
                .select('*', { count: 'exact', head: true })
                .gte('depth', 3)

            // Open spots calculation not available (no is_open_spot column)
            const openSpotsCount = 0

            // Fetch real wallet data
            const { count: walletsCount } = await supabase
                .from('user_wallets')
                .select('*', { count: 'exact', head: true })

            // Total AF in circulation (sum of all user wallet balances)
            const { data: walletSums } = await supabase
                .from('user_wallets')
                .select('available_balance, pending_balance, total_earned')

            const totalAfro = walletSums?.reduce((sum, w) =>
                sum + parseFloat(w.available_balance || 0) + parseFloat(w.pending_balance || 0), 0) || 0

            // Fetch Poverty Fund balance
            const { data: povertyData } = await supabase
                .from('poverty_fund')
                .select('total_balance, total_received')
                .single()

            const povertyFund = parseFloat(povertyData?.total_balance || 0)

            // TODO: Fetch from megabucks tables when implemented
            const totalMB = 0
            const mbBacking = 0
            const operating = 0

            setStats({
                totalUsers: totalUsers || 0,
                totalFounders: foundersCount || 0,
                totalPremiere: premiereCount || 0,
                totalStandard: standardCount || 0,
                totalOpenSpots: openSpotsCount || 0,
                totalWallets: walletsCount,
                totalAfroInCirculation: totalAfro,
                totalMegabucksInCirculation: totalMB,
                povertyFundBalance: povertyFund,
                mbBackingBalance: mbBacking,
                operatingBalance: operating,
            })

            // Fetch profiles - using profiles table
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('*')
                .order('display_name', { ascending: true })
                .limit(500)

            console.log('Profiles fetched:', profilesData?.length, 'Error:', profilesError)

            if (profilesData && profilesData.length > 0) {
                // Get visa details (profiles.visa_id is auto-synced from user_visas)
                const { data: visasData } = await supabase
                    .from('visas')
                    .select('id, visa_type, badge_color')

                const visaMap = new Map(visasData?.map(v => [v.id, v]) || [])

                // Get matrix positions (depth = pyramid level, children_count = team size)
                // NOTE: RLS policies may block this - need admin policy or service role
                const { data: matrixData, error: matrixError } = await supabase
                    .from('matrix_positions')
                    .select('user_id, depth, children_count, matrix_level, readable_position')
                    .in('user_id', profilesData.map(u => u.id))

                console.log('Matrix positions fetched:', matrixData?.length, 'Error:', matrixError)
                if (matrixError) {
                    console.error('❌ Matrix fetch error:', matrixError)
                    console.error('Error details:', matrixError.message, matrixError.details, matrixError.hint)
                }

                const matrixMap = new Map(matrixData?.map(m => [m.user_id, m]) || [])

                setUsers(profilesData.map((u: any) => {
                    // Read VISA directly from profile (auto-synced from user_visas)
                    const visa = u.visa_id ? visaMap.get(u.visa_id) : null
                    const matrix = matrixMap.get(u.id)
                    return {
                        id: u.id,
                        email: u.email || 'N/A',
                        full_name: u.display_name || u.username || 'Unknown',
                        username: u.username || 'user',
                        matrix_level: matrix?.depth || 0,  // Use depth (pyramid level) not matrix_level
                        visa_type: visa?.visa_type || 'Free',
                        badge_color: visa?.badge_color || '#888',
                        afro_available: 0,  // TODO: Read from afro_funds wallet
                        megabucks_balance: 0,  // TODO: Read from megabucks_wallets
                        children_count: matrix?.children_count || 0,  // Team size
                        readable_position: matrix?.readable_position || null,
                        is_legacy_founder: u.is_legacy_founder || false,
                        created_at: u.created_at,
                    }
                }).sort((a, b) => a.full_name.localeCompare(b.full_name)))
            }

        } catch (error) {
            console.error('Error fetching admin data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    // Filter users
    const filteredUsers = users.filter(user => {
        const matchesSearch = !searchTerm ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesLevel = filterLevel === null || user.matrix_level === filterLevel
        return matchesSearch && matchesLevel
    }).sort((a, b) => a.full_name.localeCompare(b.full_name))

    const getLevelName = (level: number) => {
        switch (level) {
            case 0: return 'Poverty Relief'
            case 1: return 'Founder'
            case 2: return 'Premiere'
            default: return 'Standard'
        }
    }

    const tabs = [
        { id: 'overview', icon: BarChart3, label: 'Overview' },
        { id: 'users', icon: Users, label: 'Users' },
        { id: 'matrix', icon: Network, label: 'Matrix' },
        { id: 'genealogy', icon: Users, label: 'Genealogy' },
        { id: 'funds', icon: PiggyBank, label: 'Funds' },
    ]

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
                <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        )
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
            {/* Header */}
            <div
                className="px-6 py-6 border-b"
                style={{ backgroundColor: '#121212', borderColor: '#2a2a2a' }}
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }}
                        >
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Super Admin Dashboard</h1>
                            <p className="text-sm text-gray-400">System Overview & Management</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={fetchData}
                            className="flex items-center gap-2 px-4 py-2"
                            style={{ backgroundColor: '#2a2a2a', color: '#fff' }}
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </Button>
                        <Link
                            to="/admin/import-founders"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium"
                            style={{ background: 'linear-gradient(to right, #d4af37, #c9a227)', color: '#0a0a0a' }}
                        >
                            <UserPlus className="w-4 h-4" />
                            Import Founders
                        </Link>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b" style={{ borderColor: '#2a2a2a' }}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                    ? 'border-red-500 text-red-400'
                                    : 'border-transparent text-gray-400 hover:text-white'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="p-4" style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-500/20">
                                        <Users className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</div>
                                        <div className="text-xs text-gray-400">Total Users</div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4" style={{ backgroundColor: '#121212', border: '1px solid #d4af37' }}>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-amber-500/20">
                                        <Crown className="w-5 h-5 text-amber-400" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white">{stats?.totalFounders || 0}</div>
                                        <div className="text-xs text-gray-400">Founders (L1)</div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4" style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-purple-500/20">
                                        <Network className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white">{stats?.totalOpenSpots || 0}</div>
                                        <div className="text-xs text-gray-400">OPEN Spots</div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4" style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-green-500/20">
                                        <Wallet className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white">{stats?.totalWallets || 0}</div>
                                        <div className="text-xs text-gray-400">Wallets</div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Matrix Distribution */}
                        <Card className="p-6" style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}>
                            <h3 className="text-lg font-semibold text-white mb-4">Matrix Distribution</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 rounded-lg text-center" style={{ backgroundColor: '#0a0a0a' }}>
                                    <div className="text-3xl font-bold text-amber-400">{stats?.totalFounders || 0}</div>
                                    <div className="text-sm text-gray-400">Level 1 - Founders</div>
                                    <div className="text-xs text-gray-500 mt-1">Max: 20,000</div>
                                </div>
                                <div className="p-4 rounded-lg text-center" style={{ backgroundColor: '#0a0a0a' }}>
                                    <div className="text-3xl font-bold text-purple-400">{stats?.totalPremiere || 0}</div>
                                    <div className="text-sm text-gray-400">Level 2 - Premiere</div>
                                    <div className="text-xs text-gray-500 mt-1">Max: 400,000</div>
                                </div>
                                <div className="p-4 rounded-lg text-center" style={{ backgroundColor: '#0a0a0a' }}>
                                    <div className="text-3xl font-bold text-blue-400">{stats?.totalStandard || 0}</div>
                                    <div className="text-sm text-gray-400">Level 3+ - Standard</div>
                                    <div className="text-xs text-gray-500 mt-1">Unlimited</div>
                                </div>
                            </div>
                        </Card>

                        {/* Currency Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="p-6" style={{ backgroundColor: '#121212', border: '1px solid #22c55e' }}>
                                <div className="flex items-center gap-3 mb-4">
                                    <Coins className="w-6 h-6 text-green-400" />
                                    <h3 className="text-lg font-semibold text-white">AFRO (AF)</h3>
                                </div>
                                <div className="text-3xl font-bold text-green-400">
                                    AF {(stats?.totalAfroInCirculation || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                                </div>
                                <div className="text-sm text-gray-400 mt-1">Total AF in user wallets</div>
                            </Card>

                            <Card className="p-6" style={{ backgroundColor: '#121212', border: '1px solid #06b6d4' }}>
                                <div className="flex items-center gap-3 mb-4">
                                    <DollarSign className="w-6 h-6 text-cyan-400" />
                                    <h3 className="text-lg font-semibold text-white">MegaBucks (MB)</h3>
                                </div>
                                <div className="text-3xl font-bold text-cyan-400">
                                    {(stats?.totalMegabucksInCirculation || 0).toLocaleString()} MB
                                </div>
                                <div className="text-sm text-gray-400 mt-1">Total MB in circulation</div>
                            </Card>
                        </div>
                    </div>
                )}

                {/* USERS TAB */}
                {activeTab === 'users' && (
                    <div className="space-y-4">
                        {/* Search & Filter */}
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by email, name, or username..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg text-white"
                                    style={{ backgroundColor: '#121212', border: '1px solid #3a3a3a' }}
                                />
                            </div>
                            <select
                                value={filterLevel ?? ''}
                                onChange={(e) => setFilterLevel(e.target.value ? parseInt(e.target.value) : null)}
                                className="px-4 py-2 rounded-lg text-white"
                                style={{ backgroundColor: '#121212', border: '1px solid #3a3a3a' }}
                            >
                                <option value="">All Levels</option>
                                <option value="1">Level 1 - Founders</option>
                                <option value="2">Level 2 - Premiere</option>
                                <option value="3">Level 3+ - Standard</option>
                            </select>
                        </div>

                        {/* Users Table */}
                        <Card className="overflow-hidden" style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-900">
                                        <tr className="text-left text-gray-400 border-b border-gray-700">
                                            <th className="py-3 px-4">User</th>
                                            <th className="py-3 px-4">Email</th>
                                            <th className="py-3 px-4">Visa</th>
                                            <th className="py-3 px-4">Level</th>
                                            <th className="py-3 px-4">Position</th>
                                            <th className="py-3 px-4">Team</th>
                                            <th className="py-3 px-4">AF Balance</th>
                                            <th className="py-3 px-4">MB Balance</th>
                                            <th className="py-3 px-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((user) => (
                                            <tr key={user.id} className="text-gray-300 border-b border-gray-800 hover:bg-gray-900/50">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        {user.is_legacy_founder && (
                                                            <Crown className="w-4 h-4 text-amber-400" />
                                                        )}
                                                        <span className="font-medium text-white">{user.full_name}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500">@{user.username}</div>
                                                </td>
                                                <td className="py-3 px-4 text-gray-400">{user.email}</td>
                                                <td className="py-3 px-4">
                                                    <span
                                                        className="px-2 py-1 rounded text-xs font-medium"
                                                        style={{ backgroundColor: user.badge_color, color: '#fff' }}
                                                    >
                                                        {user.visa_type}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">{getLevelName(user.matrix_level)}</td>
                                                <td className="py-3 px-4 font-mono text-amber-400">
                                                    {user.readable_position || 'Not placed'}
                                                </td>
                                                <td className="py-3 px-4">{user.children_count}</td>
                                                <td className="py-3 px-4 text-green-400">
                                                    AF {parseFloat(user.afro_available as any).toFixed(2)}
                                                </td>
                                                <td className="py-3 px-4 text-cyan-400">
                                                    {parseInt(user.megabucks_balance as any).toLocaleString()} MB
                                                </td>
                                                <td className="py-3 px-4">
                                                    <button className="text-gray-400 hover:text-white">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {filteredUsers.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    No users found
                                </div>
                            )}
                        </Card>
                    </div>
                )}


                {/* Genealogy Tab */}
                {activeTab === 'genealogy' && (
                    <div className="max-w-7xl mx-auto px-6 py-8">
                        <GenealogyTreeView />
                    </div>
                )}

                {/* FUNDS TAB */}
                {activeTab === 'funds' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                            <Card className="p-6" style={{ backgroundColor: '#121212', border: '1px solid #f59e0b' }}>
                                <div className="flex items-center gap-3 mb-4">
                                    <PiggyBank className="w-8 h-8 text-amber-400" />
                                    <h3 className="text-lg font-semibold text-white">Poverty Fund</h3>
                                </div>
                                <div className="text-4xl font-bold text-amber-400 mb-2">
                                    AF {(stats?.povertyFundBalance || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                                </div>
                                <p className="text-sm text-gray-400">
                                    For poverty relief programs and MB backing
                                </p>
                            </Card>

                            <Card className="p-6" style={{ backgroundColor: '#121212', border: '1px solid #06b6d4' }}>
                                <div className="flex items-center gap-3 mb-4">
                                    <Coins className="w-8 h-8 text-cyan-400" />
                                    <h3 className="text-lg font-semibold text-white">MB Backing</h3>
                                </div>
                                <div className="text-4xl font-bold text-cyan-400 mb-2">
                                    AF {(stats?.mbBackingBalance || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                                </div>
                                <p className="text-sm text-gray-400">
                                    100% backs all MegaBucks in circulation
                                </p>
                            </Card>

                            <Card className="p-6" style={{ backgroundColor: '#121212', border: '1px solid #22c55e' }}>
                                <div className="flex items-center gap-3 mb-4">
                                    <DollarSign className="w-8 h-8 text-green-400" />
                                    <h3 className="text-lg font-semibold text-white">Operating</h3>
                                </div>
                                <div className="text-4xl font-bold text-green-400 mb-2">
                                    AF {(stats?.operatingBalance || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                                </div>
                                <p className="text-sm text-gray-400">
                                    Company operational funds
                                </p>
                            </Card>
                        </div>
                    </div>
                )}

                {/* MATRIX TAB */}
                {activeTab === 'matrix' && (
                    <div className="space-y-6">
                        {/* Matrix Stats */}
                        <div className="grid grid-cols-4 gap-4">
                            <Card className="p-4 text-center" style={{ backgroundColor: '#121212', border: '1px solid #d4af37' }}>
                                <div className="text-3xl font-bold text-amber-400">{stats?.totalFounders || 0}</div>
                                <div className="text-sm text-gray-400">Level 1 Founders</div>
                            </Card>
                            <Card className="p-4 text-center" style={{ backgroundColor: '#121212', border: '1px solid #9333ea' }}>
                                <div className="text-3xl font-bold text-purple-400">{stats?.totalPremiere || 0}</div>
                                <div className="text-sm text-gray-400">Level 2 Premiere</div>
                            </Card>
                            <Card className="p-4 text-center" style={{ backgroundColor: '#121212', border: '1px solid #3b82f6' }}>
                                <div className="text-3xl font-bold text-blue-400">{stats?.totalStandard || 0}</div>
                                <div className="text-sm text-gray-400">Level 3+ Standard</div>
                            </Card>
                            <Card className="p-4 text-center" style={{ backgroundColor: '#121212', border: '1px solid #22c55e' }}>
                                <div className="text-3xl font-bold text-green-400">{stats?.totalOpenSpots || 0}</div>
                                <div className="text-sm text-gray-400">OPEN Spots</div>
                            </Card>
                        </div>

                        {/* Matrix Visual */}
                        <Card className="p-6" style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}>
                            <h3 className="text-lg font-semibold text-white mb-6">Matrix Pyramid</h3>

                            {/* Level 0 - Poverty Relief */}
                            <div className="flex flex-col items-center mb-8">
                                <div
                                    className="w-32 h-16 rounded-lg flex items-center justify-center text-center"
                                    style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }}
                                >
                                    <div>
                                        <div className="text-white font-bold text-sm">Level 0</div>
                                        <div className="text-white/80 text-xs">Poverty Relief</div>
                                    </div>
                                </div>
                                <div className="w-px h-8 bg-gray-600"></div>
                            </div>

                            {/* Level 1 - Founders */}
                            <div className="flex flex-col items-center mb-8">
                                <div className="flex gap-2 flex-wrap justify-center max-w-4xl">
                                    {[...Array(Math.min(stats?.totalFounders || 0, 20))].map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-10 h-10 rounded flex items-center justify-center text-xs font-bold"
                                            style={{ background: 'linear-gradient(135deg, #d4af37 0%, #c9a227 100%)', color: '#0a0a0a' }}
                                            title={`Founder ${i + 1}`}
                                        >
                                            <Crown className="w-4 h-4" />
                                        </div>
                                    ))}
                                    {(stats?.totalFounders || 0) > 20 && (
                                        <div className="w-10 h-10 rounded bg-gray-700 flex items-center justify-center text-xs text-white">
                                            +{(stats?.totalFounders || 0) - 20}
                                        </div>
                                    )}
                                </div>
                                <div className="mt-2 text-amber-400 font-medium">Level 1: {stats?.totalFounders || 0} Founders</div>
                                <div className="text-gray-500 text-xs">Max 20 children each → 400,000 Level 2 spots</div>
                            </div>

                            {/* Level 2 - Premiere */}
                            <div className="flex flex-col items-center mb-8">
                                <div className="flex gap-1 flex-wrap justify-center max-w-4xl">
                                    {[...Array(Math.min(stats?.totalPremiere || 0, 30))].map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-6 h-6 rounded bg-purple-600"
                                            title={`Premiere ${i + 1}`}
                                        />
                                    ))}
                                    {(stats?.totalPremiere || 0) > 30 && (
                                        <div className="px-2 h-6 rounded bg-gray-700 flex items-center justify-center text-xs text-white">
                                            +{(stats?.totalPremiere || 0) - 30}
                                        </div>
                                    )}
                                    {(stats?.totalPremiere || 0) === 0 && (
                                        <div className="text-gray-500 text-sm">No Premiere members yet</div>
                                    )}
                                </div>
                                <div className="mt-2 text-purple-400 font-medium">Level 2: {stats?.totalPremiere || 0} Premiere</div>
                                <div className="text-gray-500 text-xs">Max 10 children each</div>
                            </div>

                            {/* Level 3+ - Standard */}
                            <div className="flex flex-col items-center">
                                <div className="w-full h-12 rounded-lg bg-gradient-to-r from-blue-900 via-blue-600 to-blue-900 flex items-center justify-center">
                                    <span className="text-white font-medium">Level 3+: {stats?.totalStandard || 0} Standard Members</span>
                                </div>
                                <div className="text-gray-500 text-xs mt-2">Unlimited growth potential</div>
                            </div>
                        </Card>

                        {/* Recent Matrix Positions */}
                        <Card className="p-6" style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}>
                            <h3 className="text-lg font-semibold text-white mb-4">Recent Founders</h3>
                            <div className="grid grid-cols-5 gap-3">
                                {filteredUsers.slice(0, 10).map((user) => (
                                    <div
                                        key={user.id}
                                        className="p-3 rounded-lg text-center"
                                        style={{ backgroundColor: '#0a0a0a' }}
                                    >
                                        <Crown className="w-6 h-6 mx-auto mb-2 text-amber-400" />
                                        <div className="text-white text-sm font-medium truncate">{user.full_name}</div>
                                        <div className="text-gray-500 text-xs">Level {user.matrix_level}</div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}
            </div>

            {/* Scroll to Top Button */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-8 right-8 p-3 rounded-full shadow-lg transition-all hover:scale-110"
                style={{
                    background: 'linear-gradient(135deg, #d4af37 0%, #c9a227 100%)',
                    color: '#0a0a0a'
                }}
                title="Back to Top"
            >
                <ArrowUp className="w-6 h-6" />
            </button>
        </div>
    )
}

export default AdminDashboard
