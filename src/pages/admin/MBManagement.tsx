// ============================================================================
// MEGABUCKS MANAGEMENT - ADMIN PAGE
// ============================================================================
// Manage MB earning rules, view history, and award MB manually
// ============================================================================

import { useState, useEffect } from 'react'
import {
    Coins,
    RefreshCw,
    Edit2,
    Save,
    X,
    Check,
    Plus,
    History,
    Users,
    Gift,
    Settings,
    TrendingUp,
    Search,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

interface MBRule {
    id: string
    rule_code: string
    rule_name: string
    description: string
    mb_amount: number
    daily_limit: number | null
    weekly_limit: number | null
    monthly_limit: number | null
    lifetime_limit: number | null
    is_active: boolean
    created_at: string
}

interface MBHistory {
    id: string
    user_id: string
    rule_code: string
    mb_amount: number
    description: string | null
    created_at: string
    username?: string
}

interface MBStats {
    totalRules: number
    activeRules: number
    totalMBAwarded: number
    todayMBAwarded: number
}

export function MBManagement() {
    const [rules, setRules] = useState<MBRule[]>([])
    const [history, setHistory] = useState<MBHistory[]>([])
    const [stats, setStats] = useState<MBStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'rules' | 'history' | 'award'>('rules')
    const [editingRule, setEditingRule] = useState<string | null>(null)
    const [editAmount, setEditAmount] = useState<number>(0)
    const [searchTerm, setSearchTerm] = useState('')

    // Award MB form state
    const [awardUsername, setAwardUsername] = useState('')
    const [awardRuleCode, setAwardRuleCode] = useState('')
    const [awardMessage, setAwardMessage] = useState('')

    const fetchData = async () => {
        setIsLoading(true)
        try {
            // Fetch rules
            const { data: rulesData } = await supabase
                .from('mb_earning_rules')
                .select('*')
                .order('rule_code')

            if (rulesData) {
                setRules(rulesData)
            }

            // Fetch recent history
            const { data: historyData } = await supabase
                .from('mb_earning_history')
                .select(`
                    id,
                    user_id,
                    rule_code,
                    mb_amount,
                    description,
                    created_at
                `)
                .order('created_at', { ascending: false })
                .limit(100)

            if (historyData) {
                // Get usernames for each history entry
                const userIds = [...new Set(historyData.map(h => h.user_id))]
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, username')
                    .in('id', userIds)

                const usernameMap = new Map(profiles?.map(p => [p.id, p.username]) || [])

                setHistory(historyData.map(h => ({
                    ...h,
                    username: usernameMap.get(h.user_id) || 'Unknown'
                })))
            }

            // Calculate stats
            const activeRules = rulesData?.filter(r => r.is_active).length || 0
            const { data: todayHistory } = await supabase
                .from('mb_earning_history')
                .select('mb_amount')
                .gte('created_at', new Date().toISOString().split('T')[0])

            const todayTotal = todayHistory?.reduce((sum, h) => sum + h.mb_amount, 0) || 0

            const { data: allHistory } = await supabase
                .from('mb_earning_history')
                .select('mb_amount')

            const totalAwarded = allHistory?.reduce((sum, h) => sum + h.mb_amount, 0) || 0

            setStats({
                totalRules: rulesData?.length || 0,
                activeRules,
                totalMBAwarded: totalAwarded,
                todayMBAwarded: todayTotal,
            })

        } catch (error) {
            console.error('Error fetching MB data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleUpdateAmount = async (ruleId: string) => {
        try {
            const { error } = await supabase
                .from('mb_earning_rules')
                .update({ mb_amount: editAmount, updated_at: new Date().toISOString() })
                .eq('id', ruleId)

            if (error) throw error

            setRules(rules.map(r =>
                r.id === ruleId ? { ...r, mb_amount: editAmount } : r
            ))
            setEditingRule(null)
        } catch (error) {
            console.error('Error updating rule:', error)
        }
    }

    const handleToggleActive = async (ruleId: string, currentState: boolean) => {
        try {
            const { error } = await supabase
                .from('mb_earning_rules')
                .update({ is_active: !currentState, updated_at: new Date().toISOString() })
                .eq('id', ruleId)

            if (error) throw error

            setRules(rules.map(r =>
                r.id === ruleId ? { ...r, is_active: !currentState } : r
            ))
        } catch (error) {
            console.error('Error toggling rule:', error)
        }
    }

    const handleAwardMB = async () => {
        if (!awardUsername || !awardRuleCode) {
            setAwardMessage('Please enter username and select a rule')
            return
        }

        try {
            // Get user ID
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('username', awardUsername)
                .single()

            if (!profile) {
                setAwardMessage('User not found')
                return
            }

            // Call award function via RPC
            const { data, error } = await supabase.rpc('award_megabucks', {
                p_user_id: profile.id,
                p_rule_code: awardRuleCode,
                p_description: 'Manually awarded by admin'
            })

            if (error) throw error

            if (data && data.length > 0) {
                if (data[0].success) {
                    setAwardMessage(`✅ ${data[0].message}`)
                    setAwardUsername('')
                    fetchData()
                } else {
                    setAwardMessage(`❌ ${data[0].message}`)
                }
            }
        } catch (error: any) {
            setAwardMessage(`Error: ${error.message}`)
        }
    }

    const filteredRules = rules.filter(rule =>
        rule.rule_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.rule_name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const tabs = [
        { id: 'rules', icon: Settings, label: 'Earning Rules' },
        { id: 'history', icon: History, label: 'History' },
        { id: 'award', icon: Gift, label: 'Award MB' },
    ]

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
                <RefreshCw className="w-8 h-8 animate-spin text-cyan-500" />
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
                            style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' }}
                        >
                            <Coins className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">MegaBucks Management</h1>
                            <p className="text-sm text-gray-400">Configure earning rules and award MB</p>
                        </div>
                    </div>
                    <Button
                        onClick={fetchData}
                        className="flex items-center gap-2 px-4 py-2"
                        style={{ backgroundColor: '#2a2a2a', color: '#fff' }}
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Card className="p-4" style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-cyan-500/20">
                                <Settings className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{stats?.totalRules || 0}</div>
                                <div className="text-xs text-gray-400">Total Rules</div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4" style={{ backgroundColor: '#121212', border: '1px solid #22c55e' }}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/20">
                                <Check className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{stats?.activeRules || 0}</div>
                                <div className="text-xs text-gray-400">Active Rules</div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4" style={{ backgroundColor: '#121212', border: '1px solid #06b6d4' }}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-cyan-500/20">
                                <Coins className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{stats?.totalMBAwarded?.toLocaleString() || 0}</div>
                                <div className="text-xs text-gray-400">Total MB Awarded</div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4" style={{ backgroundColor: '#121212', border: '1px solid #f59e0b' }}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-500/20">
                                <TrendingUp className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{stats?.todayMBAwarded?.toLocaleString() || 0}</div>
                                <div className="text-xs text-gray-400">Awarded Today</div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-6 border-b" style={{ borderColor: '#2a2a2a' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                ? 'border-cyan-500 text-cyan-400'
                                : 'border-transparent text-gray-400 hover:text-white'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* RULES TAB */}
                {activeTab === 'rules' && (
                    <div className="space-y-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search rules..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg text-white"
                                style={{ backgroundColor: '#121212', border: '1px solid #3a3a3a' }}
                            />
                        </div>

                        {/* Rules Table */}
                        <Card className="overflow-hidden" style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-900">
                                        <tr className="text-left text-gray-400 border-b border-gray-700">
                                            <th className="py-3 px-4">Rule Code</th>
                                            <th className="py-3 px-4">Name</th>
                                            <th className="py-3 px-4">MB Amount</th>
                                            <th className="py-3 px-4">Daily Limit</th>
                                            <th className="py-3 px-4">Lifetime Limit</th>
                                            <th className="py-3 px-4">Status</th>
                                            <th className="py-3 px-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRules.map((rule) => (
                                            <tr key={rule.id} className="text-gray-300 border-b border-gray-800 hover:bg-gray-900/50">
                                                <td className="py-3 px-4 font-mono text-cyan-400">{rule.rule_code}</td>
                                                <td className="py-3 px-4">
                                                    <div className="font-medium text-white">{rule.rule_name}</div>
                                                    <div className="text-xs text-gray-500">{rule.description}</div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {editingRule === rule.id ? (
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                value={editAmount}
                                                                onChange={(e) => setEditAmount(parseInt(e.target.value) || 0)}
                                                                className="w-20 px-2 py-1 rounded text-white"
                                                                style={{ backgroundColor: '#0a0a0a', border: '1px solid #3a3a3a' }}
                                                            />
                                                            <button
                                                                onClick={() => handleUpdateAmount(rule.id)}
                                                                className="p-1 text-green-400 hover:text-green-300"
                                                            >
                                                                <Save className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingRule(null)}
                                                                className="p-1 text-red-400 hover:text-red-300"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-cyan-400 font-bold">{rule.mb_amount} MB</span>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingRule(rule.id)
                                                                    setEditAmount(rule.mb_amount)
                                                                }}
                                                                className="p-1 text-gray-400 hover:text-white"
                                                            >
                                                                <Edit2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">{rule.daily_limit || '∞'}</td>
                                                <td className="py-3 px-4">{rule.lifetime_limit || '∞'}</td>
                                                <td className="py-3 px-4">
                                                    <button
                                                        onClick={() => handleToggleActive(rule.id, rule.is_active)}
                                                        className={`px-2 py-1 rounded text-xs font-medium ${rule.is_active
                                                            ? 'bg-green-500/20 text-green-400'
                                                            : 'bg-red-500/20 text-red-400'
                                                            }`}
                                                    >
                                                        {rule.is_active ? 'Active' : 'Inactive'}
                                                    </button>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <button
                                                        onClick={() => handleToggleActive(rule.id, rule.is_active)}
                                                        className="text-gray-400 hover:text-white text-xs"
                                                    >
                                                        {rule.is_active ? 'Disable' : 'Enable'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                )}

                {/* HISTORY TAB */}
                {activeTab === 'history' && (
                    <Card className="overflow-hidden" style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-900">
                                    <tr className="text-left text-gray-400 border-b border-gray-700">
                                        <th className="py-3 px-4">Date</th>
                                        <th className="py-3 px-4">User</th>
                                        <th className="py-3 px-4">Rule</th>
                                        <th className="py-3 px-4">Amount</th>
                                        <th className="py-3 px-4">Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-gray-500">
                                                No MB earnings recorded yet
                                            </td>
                                        </tr>
                                    ) : (
                                        history.map((item) => (
                                            <tr key={item.id} className="text-gray-300 border-b border-gray-800">
                                                <td className="py-3 px-4 text-gray-400">
                                                    {new Date(item.created_at).toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="text-amber-400">@{item.username}</span>
                                                </td>
                                                <td className="py-3 px-4 font-mono text-cyan-400">{item.rule_code}</td>
                                                <td className="py-3 px-4 text-green-400 font-bold">+{item.mb_amount} MB</td>
                                                <td className="py-3 px-4 text-gray-500">{item.description || '-'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {/* AWARD TAB */}
                {activeTab === 'award' && (
                    <Card className="p-6" style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}>
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Gift className="w-5 h-5 text-cyan-400" />
                            Manually Award MegaBucks
                        </h3>

                        <div className="space-y-4 max-w-md">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Username</label>
                                <input
                                    type="text"
                                    placeholder="Enter username"
                                    value={awardUsername}
                                    onChange={(e) => setAwardUsername(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg text-white"
                                    style={{ backgroundColor: '#0a0a0a', border: '1px solid #3a3a3a' }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Award Type</label>
                                <select
                                    value={awardRuleCode}
                                    onChange={(e) => setAwardRuleCode(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg text-white"
                                    style={{ backgroundColor: '#0a0a0a', border: '1px solid #3a3a3a' }}
                                >
                                    <option value="">Select a rule...</option>
                                    {rules.filter(r => r.is_active).map(rule => (
                                        <option key={rule.id} value={rule.rule_code}>
                                            {rule.rule_name} ({rule.mb_amount} MB)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Button
                                onClick={handleAwardMB}
                                className="w-full py-2 font-medium"
                                style={{ background: 'linear-gradient(to right, #06b6d4, #0891b2)', color: 'white' }}
                            >
                                <Gift className="w-4 h-4 mr-2 inline" />
                                Award MegaBucks
                            </Button>

                            {awardMessage && (
                                <div className={`p-3 rounded-lg text-sm ${awardMessage.startsWith('✅')
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-red-500/20 text-red-400'
                                    }`}>
                                    {awardMessage}
                                </div>
                            )}
                        </div>
                    </Card>
                )}
            </div>
        </div>
    )
}

export default MBManagement
