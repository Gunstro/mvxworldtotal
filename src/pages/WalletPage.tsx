import { useState } from 'react'
import {
    Coins,
    TrendingUp,
    ArrowUpRight,
    ArrowDownLeft,
    CreditCard,
    History,
    PiggyBank,
    Gift,
    Users,
    ChevronRight,
    Sparkles,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Transaction {
    id: string
    type: 'earned' | 'spent' | 'withdrawn' | 'received'
    amount: number
    description: string
    timestamp: string
    source?: string
}

const mockTransactions: Transaction[] = [
    {
        id: '1',
        type: 'earned',
        amount: 25,
        description: 'Post engagement bonus',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        source: 'Post #1234',
    },
    {
        id: '2',
        type: 'received',
        amount: 50,
        description: 'Tip from @mike_torres',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: '3',
        type: 'earned',
        amount: 100,
        description: 'Matrix commission',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        source: 'Level 2 referral',
    },
    {
        id: '4',
        type: 'spent',
        amount: -30,
        description: 'Profile boost',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: '5',
        type: 'withdrawn',
        amount: -200,
        description: 'Withdrawal to PayPal',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    },
]

const earningsSources = [
    { icon: Heart, label: 'Engagement', amount: 450, color: '#ef4444' },
    { icon: Users, label: 'Referrals', amount: 320, color: '#8b5cf6' },
    { icon: Gift, label: 'Tips Received', amount: 180, color: '#10b981' },
    { icon: Sparkles, label: 'Bonuses', amount: 150, color: '#f59e0b' },
]

import { Heart } from 'lucide-react'

export function WalletPage() {
    const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'withdraw'>('overview')

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const days = Math.floor(hours / 24)

        if (hours < 1) return 'Just now'
        if (hours < 24) return `${hours}h ago`
        if (days < 7) return `${days}d ago`
        return date.toLocaleDateString()
    }

    const getTransactionIcon = (type: Transaction['type']) => {
        switch (type) {
            case 'earned':
                return <TrendingUp className="text-green-500" size={20} />
            case 'received':
                return <ArrowDownLeft className="text-blue-500" size={20} />
            case 'spent':
                return <ArrowUpRight className="text-orange-500" size={20} />
            case 'withdrawn':
                return <CreditCard className="text-purple-500" size={20} />
        }
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">MegaBucks Wallet</h1>
                <p className="text-gray-500">Manage your earnings and withdrawals</p>
            </div>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Main Balance */}
                <Card
                    padding="lg"
                    className="md:col-span-2"
                    style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
                >
                    <div className="text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <Coins size={24} />
                            <span className="text-white/80">Available Balance</span>
                        </div>
                        <div className="text-4xl font-bold mb-4">1,250.50 MB</div>
                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                size="sm"
                                className="bg-white/20 hover:bg-white/30 text-white border-0"
                            >
                                Withdraw
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="bg-white/20 hover:bg-white/30 text-white border-0"
                            >
                                Send Tip
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Pending */}
                <Card padding="lg">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                        <PiggyBank size={20} />
                        <span>Pending</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">125.00 MB</div>
                    <p className="text-sm text-gray-500">Clears in 7 days</p>
                </Card>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card padding="md">
                    <p className="text-sm text-gray-500 mb-1">Today</p>
                    <p className="text-xl font-bold text-green-600">+42.5 MB</p>
                </Card>
                <Card padding="md">
                    <p className="text-sm text-gray-500 mb-1">This Week</p>
                    <p className="text-xl font-bold text-green-600">+285 MB</p>
                </Card>
                <Card padding="md">
                    <p className="text-sm text-gray-500 mb-1">This Month</p>
                    <p className="text-xl font-bold text-green-600">+1,450 MB</p>
                </Card>
                <Card padding="md">
                    <p className="text-sm text-gray-500 mb-1">All Time</p>
                    <p className="text-xl font-bold text-gray-900">12,450 MB</p>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-6">
                {(['overview', 'transactions', 'withdraw'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`
              flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors
              ${activeTab === tab
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }
            `}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Earnings Breakdown */}
                    <Card padding="md">
                        <h3 className="font-semibold text-gray-900 mb-4">Earnings This Month</h3>
                        <div className="space-y-4">
                            {earningsSources.map((source) => {
                                const Icon = source.icon
                                return (
                                    <div key={source.label} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center"
                                                style={{ backgroundColor: `${source.color}20` }}
                                            >
                                                <Icon size={20} style={{ color: source.color }} />
                                            </div>
                                            <span className="text-gray-700">{source.label}</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">+{source.amount} MB</span>
                                    </div>
                                )
                            })}
                        </div>
                    </Card>

                    {/* Quick Actions */}
                    <Card padding="md">
                        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <CreditCard size={20} className="text-purple-500" />
                                    <span className="text-gray-700">Withdraw to Bank</span>
                                </div>
                                <ChevronRight size={18} className="text-gray-400" />
                            </button>
                            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Gift size={20} className="text-green-500" />
                                    <span className="text-gray-700">Send a Tip</span>
                                </div>
                                <ChevronRight size={18} className="text-gray-400" />
                            </button>
                            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Users size={20} className="text-blue-500" />
                                    <span className="text-gray-700">Invite Friends (+50 MB)</span>
                                </div>
                                <ChevronRight size={18} className="text-gray-400" />
                            </button>
                            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <History size={20} className="text-gray-500" />
                                    <span className="text-gray-700">Transaction History</span>
                                </div>
                                <ChevronRight size={18} className="text-gray-400" />
                            </button>
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'transactions' && (
                <Card padding="none">
                    <div className="divide-y divide-gray-100">
                        {mockTransactions.map((tx) => (
                            <div
                                key={tx.id}
                                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                        {getTransactionIcon(tx.type)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{tx.description}</p>
                                        <p className="text-sm text-gray-500">
                                            {tx.source && `${tx.source} · `}
                                            {formatTime(tx.timestamp)}
                                        </p>
                                    </div>
                                </div>
                                <span
                                    className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-gray-900'
                                        }`}
                                >
                                    {tx.amount > 0 ? '+' : ''}{tx.amount} MB
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {activeTab === 'withdraw' && (
                <Card padding="lg">
                    <h3 className="font-semibold text-gray-900 mb-4">Withdraw MegaBucks</h3>
                    <p className="text-gray-500 mb-6">
                        Convert your MegaBucks to real money. Minimum withdrawal: 500 MB.
                        Current rate: 1 MB = £0.01
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Amount to Withdraw
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    placeholder="Enter amount"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    MB
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Withdrawal Method
                            </label>
                            <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option>PayPal</option>
                                <option>Bank Transfer</option>
                                <option>Crypto (USDT)</option>
                            </select>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-500">You withdraw</span>
                                <span className="font-medium">1,000 MB</span>
                            </div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-500">Processing fee (2%)</span>
                                <span className="font-medium">-20 MB</span>
                            </div>
                            <div className="border-t border-gray-200 pt-2 mt-2">
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-700">You receive</span>
                                    <span className="font-bold text-green-600">£9.80</span>
                                </div>
                            </div>
                        </div>

                        <Button className="w-full" size="lg">
                            Withdraw Now
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    )
}
