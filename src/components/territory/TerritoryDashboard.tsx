// ============================================================================
// TERRITORY DASHBOARD
// ============================================================================
// Dashboard showing territory stats, owned territories, and earnings
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
    Globe,
    MapPin,
    TrendingUp,
    Wallet,
    PoundSterling,
    Building2,
    Landmark,
    Users,
    ArrowUpRight,
    ArrowDownRight,
    Eye,
    Clock,
    ChevronRight,
    Sparkles,
    Map
} from 'lucide-react';
import type {
    TerritoryDashboardStats,
    UserWallet,
    WalletTransaction,
    AdminLevelCode
} from '../../types/territory';
import {
    getTerritoryDashboardStats,
    getUserWallet,
    getUserWalletTransactions,
    getUserTerritories,
    getUserEarningsReport
} from '../../lib/territoryApi';

interface TerritoryDashboardProps {
    userId: string;
    onNavigateToMap?: () => void;
    className?: string;
}

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    change?: number;
    subtext?: string;
    gradient: string;
}

const StatCard: React.FC<StatCardProps> = ({
    icon,
    label,
    value,
    change,
    subtext,
    gradient
}) => (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
        <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient}`}>
                {icon}
            </div>
            {change !== undefined && (
                <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {Math.abs(change)}%
                </div>
            )}
        </div>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        <div className="text-sm text-gray-400">{label}</div>
        {subtext && <div className="text-xs text-gray-500 mt-1">{subtext}</div>}
    </div>
);

interface OwnedTerritoryCardProps {
    name: string;
    adminLevel: AdminLevelCode;
    levelName: string;
    commissionRate: number;
    purchaseDate: string;
    totalEarnings?: number;
}

const OwnedTerritoryCard: React.FC<OwnedTerritoryCardProps> = ({
    name,
    adminLevel,
    levelName,
    commissionRate,
    purchaseDate,
    totalEarnings
}) => {
    const levelColors: Record<AdminLevelCode, string> = {
        'ADMIN0': 'from-purple-500 to-indigo-600',
        'ADMIN1': 'from-blue-500 to-cyan-600',
        'ADMIN2': 'from-green-500 to-emerald-600',
        'ADMIN3': 'from-yellow-500 to-orange-600',
        'ADMIN4': 'from-red-500 to-pink-600',
        'ADMIN5': 'from-teal-500 to-cyan-600',
        'FRAG': 'from-amber-500 to-yellow-600'
    };

    return (
        <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50 hover:border-emerald-500/30 transition-colors">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="font-semibold text-white">{name}</h3>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs bg-gradient-to-r ${levelColors[adminLevel]} text-white`}>
                        {levelName}
                    </span>
                </div>
                <div className="text-right">
                    <div className="text-emerald-400 font-semibold">{commissionRate}%</div>
                    <div className="text-xs text-gray-500">Commission</div>
                </div>
            </div>
            <div className="flex items-center justify-between text-sm">
                <div className="text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(purchaseDate).toLocaleDateString()}
                </div>
                {totalEarnings !== undefined && (
                    <div className="text-emerald-400 font-semibold flex items-center gap-1">
                        <PoundSterling className="w-3 h-3" />
                        £{totalEarnings.toLocaleString('en-GB')}
                    </div>
                )}
            </div>
        </div>
    );
};

interface TransactionItemProps {
    type: string;
    description: string;
    amount: number;
    date: string;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
    type,
    description,
    amount,
    date
}) => {
    const isPositive = amount > 0;
    const typeIcons: Record<string, React.ReactNode> = {
        'commission': <TrendingUp className="w-4 h-4 text-emerald-400" />,
        'bonus': <Sparkles className="w-4 h-4 text-amber-400" />,
        'withdrawal': <ArrowUpRight className="w-4 h-4 text-blue-400" />,
        'adjustment': <PoundSterling className="w-4 h-4 text-gray-400" />
    };

    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-800/50">
                    {typeIcons[type] || <PoundSterling className="w-4 h-4 text-gray-400" />}
                </div>
                <div>
                    <div className="text-white text-sm">{description}</div>
                    <div className="text-xs text-gray-500">{new Date(date).toLocaleDateString()}</div>
                </div>
            </div>
            <div className={`font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}£{Math.abs(amount).toLocaleString('en-GB')}
            </div>
        </div>
    );
};

export const TerritoryDashboard: React.FC<TerritoryDashboardProps> = ({
    userId,
    onNavigateToMap,
    className = ''
}) => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<TerritoryDashboardStats | null>(null);
    const [wallet, setWallet] = useState<UserWallet | null>(null);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [ownedTerritories, setOwnedTerritories] = useState<{
        ownership_id: string;
        admin_level_code: AdminLevelCode;
        level_name: string;
        territory_id: string;
        territory_name: string;
        commission_rate: number;
        purchase_date: string;
    }[]>([]);
    const [earnings, setEarnings] = useState<{
        admin_level_code: AdminLevelCode;
        territory_name: string;
        total_sales: number;
        total_sale_value: number;
        total_commission: number;
        commission_rate: number;
    }[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, [userId]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [statsData, walletData, txData, territoriesData, earningsData] = await Promise.all([
                getTerritoryDashboardStats(),
                getUserWallet(userId),
                getUserWalletTransactions(userId, 10),
                getUserTerritories(userId),
                getUserEarningsReport(userId)
            ]);

            setStats(statsData);
            setWallet(walletData);
            setTransactions(txData);
            setOwnedTerritories(territoriesData);
            setEarnings(earningsData);
        } catch (err) {
            console.error('Failed to load dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={`flex items-center justify-center py-20 ${className}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Territory Dashboard</h1>
                    <p className="text-gray-400">Manage your territories and track earnings</p>
                </div>
                {onNavigateToMap && (
                    <button
                        onClick={onNavigateToMap}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-lg text-white font-semibold transition-all duration-300"
                    >
                        <Map className="w-5 h-5" />
                        Explore Map
                    </button>
                )}
            </div>

            {/* Wallet Summary */}
            {wallet && (
                <div className="bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-2xl p-6 border border-emerald-500/30">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                            <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Your Wallet</h2>
                            <p className="text-sm text-gray-400">Earnings from territory commissions</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <div className="text-3xl font-bold text-white">
                                £{wallet.available_balance.toLocaleString('en-GB')}
                            </div>
                            <div className="text-sm text-gray-400">Available Balance</div>
                        </div>
                        <div>
                            <div className="text-xl font-semibold text-amber-400">
                                £{wallet.pending_balance.toLocaleString('en-GB')}
                            </div>
                            <div className="text-sm text-gray-400">Pending</div>
                        </div>
                        <div>
                            <div className="text-xl font-semibold text-emerald-400">
                                £{wallet.total_earned.toLocaleString('en-GB')}
                            </div>
                            <div className="text-sm text-gray-400">Total Earned</div>
                        </div>
                        <div>
                            <div className="text-xl font-semibold text-cyan-400">
                                {wallet.total_territories_owned}
                            </div>
                            <div className="text-sm text-gray-400">Territories Owned</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    <StatCard
                        icon={<Globe className="w-5 h-5 text-white" />}
                        label="Zones"
                        value={stats.total_zones}
                        gradient="from-purple-500 to-indigo-600"
                    />
                    <StatCard
                        icon={<Map className="w-5 h-5 text-white" />}
                        label="Countries"
                        value={stats.total_countries}
                        gradient="from-blue-500 to-cyan-600"
                    />
                    <StatCard
                        icon={<Building2 className="w-5 h-5 text-white" />}
                        label="Provinces"
                        value={stats.total_provinces}
                        gradient="from-green-500 to-emerald-600"
                    />
                    <StatCard
                        icon={<Building2 className="w-5 h-5 text-white" />}
                        label="Municipalities"
                        value={stats.total_municipalities}
                        gradient="from-yellow-500 to-orange-600"
                    />
                    <StatCard
                        icon={<MapPin className="w-5 h-5 text-white" />}
                        label="Wards"
                        value={stats.total_wards}
                        gradient="from-red-500 to-pink-600"
                    />
                    <StatCard
                        icon={<Building2 className="w-5 h-5 text-white" />}
                        label="Cities"
                        value={stats.total_cities}
                        gradient="from-teal-500 to-cyan-600"
                    />
                    <StatCard
                        icon={<Landmark className="w-5 h-5 text-white" />}
                        label="MegaFrags"
                        value={stats.total_frags}
                        gradient="from-amber-500 to-yellow-600"
                    />
                </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Owned Territories */}
                <div className="lg:col-span-2 bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-emerald-400" />
                            My Territories
                        </h2>
                        {ownedTerritories.length > 0 && (
                            <span className="text-sm text-gray-400">
                                {ownedTerritories.length} owned
                            </span>
                        )}
                    </div>

                    {ownedTerritories.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {ownedTerritories.map(territory => (
                                <OwnedTerritoryCard
                                    key={territory.ownership_id}
                                    name={territory.territory_name}
                                    adminLevel={territory.admin_level_code}
                                    levelName={territory.level_name}
                                    commissionRate={territory.commission_rate}
                                    purchaseDate={territory.purchase_date}
                                    totalEarnings={
                                        earnings.find(e => e.territory_name === territory.territory_name)?.total_commission
                                    }
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Globe className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                            <p className="text-gray-400 mb-4">You don't own any territories yet</p>
                            {onNavigateToMap && (
                                <button
                                    onClick={onNavigateToMap}
                                    className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                                >
                                    Explore Available Territories
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Recent Transactions */}
                <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                            Recent Activity
                        </h2>
                        <button className="text-sm text-emerald-400 hover:underline flex items-center gap-1">
                            View All
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {transactions.length > 0 ? (
                        <div className="divide-y divide-gray-800">
                            {transactions.map(tx => (
                                <TransactionItem
                                    key={tx.id}
                                    type={tx.transaction_type}
                                    description={tx.description}
                                    amount={tx.amount}
                                    date={tx.created_at}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <PoundSterling className="w-10 h-10 mx-auto mb-2 text-gray-600" />
                            <p className="text-gray-400">No transactions yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Earnings by Territory */}
            {earnings.length > 0 && (
                <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <PoundSterling className="w-5 h-5 text-emerald-400" />
                        Earnings by Territory
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-gray-400 border-b border-gray-800">
                                    <th className="pb-3 font-medium">Territory</th>
                                    <th className="pb-3 font-medium">Type</th>
                                    <th className="pb-3 font-medium text-right">Sales</th>
                                    <th className="pb-3 font-medium text-right">Sale Value</th>
                                    <th className="pb-3 font-medium text-right">Commission</th>
                                </tr>
                            </thead>
                            <tbody>
                                {earnings.map((earning, index) => (
                                    <tr key={index} className="border-b border-gray-800/50 last:border-0">
                                        <td className="py-3 text-white font-medium">{earning.territory_name}</td>
                                        <td className="py-3">
                                            <span className="px-2 py-1 rounded text-xs bg-gray-700 text-gray-300">
                                                {earning.admin_level_code}
                                            </span>
                                        </td>
                                        <td className="py-3 text-right text-gray-400">{earning.total_sales}</td>
                                        <td className="py-3 text-right text-gray-400">
                                            £{earning.total_sale_value.toLocaleString('en-GB')}
                                        </td>
                                        <td className="py-3 text-right text-emerald-400 font-semibold">
                                            £{earning.total_commission.toLocaleString('en-GB')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TerritoryDashboard;

