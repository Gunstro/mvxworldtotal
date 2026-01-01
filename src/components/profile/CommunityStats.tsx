import { Users, TrendingUp, Award, Flame, Target, Crown, Trophy } from 'lucide-react'
import { Card } from '@/components/ui/Card'

export interface CommunityStats {
    totalMembers: number          // Total downline
    activeVolunteers: number       // Active this month
    fabricDepth: number           // How many levels deep
    monthlyGrowth: number         // % growth this month
    communityRank: number         // Global ranking
    fabricStrength: number        // Engagement score (0-100)
}

export interface BraggingRights {
    title: string                 // e.g., "Community Champion"
    achievements: string[]         // Recent big wins
    hallOfFamePositions: {
        category: string
        rank: number
        period: string
    }[]
    topPerformerWeeks: number     // Consecutive weeks in top 100
}

interface CommunityStatsProps {
    stats: CommunityStats
    showDetails?: boolean
}

export function CommunityStatsPanel({ stats, showDetails = true }: CommunityStatsProps) {
    const getStrengthColor = (strength: number) => {
        if (strength >= 80) return 'text-green-600 bg-green-50 border-green-200'
        if (strength >= 60) return 'text-blue-600 bg-blue-50 border-blue-200'
        if (strength >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }

    const getStrengthLabel = (strength: number) => {
        if (strength >= 80) return 'Exceptional'
        if (strength >= 60) return 'Strong'
        if (strength >= 40) return 'Growing'
        return 'Building'
    }

    return (
        <Card padding="lg" className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Users className="w-6 h-6 text-blue-600" />
                    Your Community Fabric
                </h2>
                {stats.monthlyGrowth > 0 && (
                    <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-semibold">+{stats.monthlyGrowth}%</span>
                    </div>
                )}
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total Members */}
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-3xl font-bold text-blue-900">{stats.totalMembers.toLocaleString()}</p>
                    <p className="text-sm text-blue-700">Community Members</p>
                </div>

                {/* Active Volunteers */}
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <Flame className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <p className="text-3xl font-bold text-green-900">{stats.activeVolunteers}</p>
                    <p className="text-sm text-green-700">Active Volunteers</p>
                </div>

                {/* Fabric Depth */}
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <Target className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <p className="text-3xl font-bold text-purple-900">{stats.fabricDepth}</p>
                    <p className="text-sm text-purple-700">Levels Deep</p>
                </div>

                {/* Community Rank */}
                <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <Crown className="w-8 h-8 mx-auto mb-2 text-amber-600" />
                    <p className="text-3xl font-bold text-amber-900">#{stats.communityRank}</p>
                    <p className="text-sm text-amber-700">Global Rank</p>
                </div>
            </div>

            {/* Fabric Strength Indicator */}
            <div className={`p-4 rounded-lg border ${getStrengthColor(stats.fabricStrength)}`}>
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="font-semibold">Fabric Strength</h3>
                        <p className="text-xs opacity-75">Community engagement & growth</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold">{stats.fabricStrength}%</p>
                        <p className="text-xs font-medium">{getStrengthLabel(stats.fabricStrength)}</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-3 bg-white bg-opacity-50 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-current transition-all duration-500"
                        style={{ width: `${stats.fabricStrength}%` }}
                    />
                </div>
            </div>

            {/* Detailed Breakdown */}
            {showDetails && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t">
                    <div>
                        <h4 className="font-semibold mb-3 text-gray-700">Community Breakdown</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Direct Volunteers:</span>
                                <span className="font-semibold">{Math.round(stats.totalMembers * 0.15)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Indirect Members:</span>
                                <span className="font-semibold">{stats.totalMembers - Math.round(stats.totalMembers * 0.15)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Growth This Month:</span>
                                <span className="font-semibold text-green-600">+{stats.monthlyGrowth}%</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-3 text-gray-700">Activity Metrics</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Active Rate:</span>
                                <span className="font-semibold">
                                    {Math.round((stats.activeVolunteers / stats.totalMembers) * 100)}%
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Avg. Depth:</span>
                                <span className="font-semibold">{(stats.fabricDepth / 2).toFixed(1)} levels</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Engagement Score:</span>
                                <span className="font-semibold">{stats.fabricStrength}/100</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    )
}

interface BraggingRightsProps {
    braggingRights: BraggingRights
}

export function BraggingRightsPanel({ braggingRights }: BraggingRightsProps) {
    return (
        <Card padding="lg" className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300">
            {/* Header */}
            <div className="text-center mb-6">
                <Award className="w-12 h-12 mx-auto mb-3 text-yellow-600" />
                <h2 className="text-3xl font-bold text-yellow-900 mb-2">
                    🎉 Hall of Fame 🎉
                </h2>
                {braggingRights.title && (
                    <p className="text-lg font-semibold text-yellow-700">
                        "{braggingRights.title}"
                    </p>
                )}
            </div>

            {/* Top Achievements */}
            {braggingRights.achievements.length > 0 && (
                <div className="mb-6">
                    <h3 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                        <Trophy className="w-5 h-5" />
                        Latest Achievements
                    </h3>
                    <div className="space-y-2">
                        {braggingRights.achievements.map((achievement, idx) => (
                            <div
                                key={idx}
                                className="bg-white bg-opacity-60 p-3 rounded-lg border border-yellow-200"
                            >
                                <p className="text-sm text-yellow-900 flex items-start gap-2">
                                    <span className="text-yellow-600 font-bold">★</span>
                                    {achievement}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Hall of Fame Positions */}
            {braggingRights.hallOfFamePositions.length > 0 && (
                <div className="mb-6">
                    <h3 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                        <Crown className="w-5 h-5" />
                        Leaderboard Rankings
                    </h3>
                    <div className="grid gap-3">
                        {braggingRights.hallOfFamePositions.map((position, idx) => (
                            <div
                                key={idx}
                                className="bg-white bg-opacity-60 p-4 rounded-lg border border-yellow-200 flex items-center justify-between"
                            >
                                <div>
                                    <p className="font-semibold text-yellow-900 capitalize">
                                        {position.category.replace('_', ' ')}
                                    </p>
                                    <p className="text-xs text-yellow-700 capitalize">
                                        {position.period}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-yellow-600">
                                        #{position.rank}
                                    </p>
                                    {position.rank <= 3 && (
                                        <p className="text-xs font-semibold text-yellow-700">
                                            {position.rank === 1 ? '🥇 GOLD' : position.rank === 2 ? '🥈 SILVER' : '🥉 BRONZE'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Top Performer Streak */}
            {braggingRights.topPerformerWeeks > 0 && (
                <div className="bg-white bg-opacity-60 p-4 rounded-lg border-2 border-yellow-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-yellow-900">Top 100 Streak</p>
                            <p className="text-xs text-yellow-700">Consecutive weeks in Top 100</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Flame className="w-8 h-8 text-orange-500" />
                            <span className="text-4xl font-bold text-orange-600">
                                {braggingRights.topPerformerWeeks}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Motivational Message */}
            <div className="mt-6 text-center">
                <p className="text-sm text-yellow-800 italic">
                    "Keep building your community fabric to unlock more bragging rights!"
                </p>
            </div>
        </Card>
    )
}

// Compact version for profile header
export function BraggingBadge({ title }: { title: string }) {
    return (
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 px-4 py-2 rounded-full shadow-lg">
            <Award className="w-5 h-5" />
            <span className="font-bold text-sm">"{title}"</span>
        </div>
    )
}
