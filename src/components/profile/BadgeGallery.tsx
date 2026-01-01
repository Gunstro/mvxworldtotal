import { useState } from 'react'
import { Lock, Star, Trophy, TrendingUp, Users, DollarSign, Zap } from 'lucide-react'
import { Card } from '@/components/ui/Card'

export interface Badge {
    id: string
    badgeKey: string
    name: string
    description: string
    category: 'recruitment' | 'earning' | 'activity' | 'social' | 'visa' | 'special'
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    iconEmoji: string
    isEarned: boolean
    earnedAt?: string
    progress?: {
        current: number
        required: number
        unit: string
    }
    mbReward: number
    accessPerks?: string[]
}

const RARITY_COLORS = {
    common: {
        bg: 'from-gray-400 to-gray-600',
        text: 'text-gray-700',
        border: 'border-gray-300',
        glow: 'shadow-gray-300',
    },
    rare: {
        bg: 'from-blue-400 to-blue-600',
        text: 'text-blue-700',
        border: 'border-blue-400',
        glow: 'shadow-blue-400',
    },
    epic: {
        bg: 'from-purple-400 to-purple-600',
        text: 'text-purple-700',
        border: 'border-purple-400',
        glow: 'shadow-purple-400',
    },
    legendary: {
        bg: 'from-yellow-400 via-orange-500 to-red-500',
        text: 'text-yellow-700',
        border: 'border-yellow-400',
        glow: 'shadow-yellow-400',
    },
}

const CATEGORY_ICONS = {
    recruitment: Users,
    earning: DollarSign,
    activity: Zap,
    social: TrendingUp,
    visa: Star,
    special: Trophy,
}

interface BadgeCardProps {
    badge: Badge
    size?: 'sm' | 'md' | 'lg'
    onClick?: () => void
}

function BadgeCard({ badge, size = 'md', onClick }: BadgeCardProps) {
    const rarityStyle = RARITY_COLORS[badge.rarity]
    const CategoryIcon = CATEGORY_ICONS[badge.category]

    const sizeClasses = {
        sm: 'w-20',
        md: 'w-28',
        lg: 'w-36',
    }

    const iconSizes = {
        sm: 'text-3xl',
        md: 'text-5xl',
        lg: 'text-6xl',
    }

    return (
        <div
            className={`${sizeClasses[size]} flex flex-col items-center cursor-pointer transform transition-all hover:scale-105`}
            onClick={onClick}
        >
            {/* Badge Icon */}
            <div
                className={`
                    relative w-full aspect-square rounded-2xl
                    ${badge.isEarned
                        ? `bg-gradient-to-br ${rarityStyle.bg} ${rarityStyle.glow} shadow-lg`
                        : 'bg-gray-200 opacity-50'
                    }
                    flex items-center justify-center
                    border-4 ${badge.isEarned ? rarityStyle.border : 'border-gray-300'}
                `}
            >
                {badge.isEarned ? (
                    <>
                        <span className={`${iconSizes[size]} drop-shadow-lg`}>
                            {badge.iconEmoji}
                        </span>

                        {/* Rarity indicator */}
                        {badge.rarity === 'legendary' && (
                            <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1 animate-pulse">
                                <Star className="w-4 h-4 text-yellow-900 fill-yellow-900" />
                            </div>
                        )}
                    </>
                ) : (
                    <Lock className="w-8 h-8 text-gray-400" />
                )}

                {/* Progress indicator for in-progress badges */}
                {!badge.isEarned && badge.progress && (
                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-300 rounded-b-xl overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all"
                            style={{
                                width: `${(badge.progress.current / badge.progress.required) * 100}%`
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Badge Name */}
            <p className={`
                text-xs font-semibold text-center mt-2 line-clamp-2
                ${badge.isEarned ? rarityStyle.text : 'text-gray-400'}
            `}>
                {badge.name}
            </p>

            {/* Rarity Label */}
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                {badge.rarity}
            </p>
        </div>
    )
}

interface BadgeGalleryProps {
    badges: Badge[]
    pinnedBadgeIds?: string[]
    onPinBadge?: (badgeId: string) => void
}

export function BadgeGallery({ badges, pinnedBadgeIds = [], onPinBadge }: BadgeGalleryProps) {
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)
    const [filterCategory, setFilterCategory] = useState<string>('all')
    const [filterRarity, setFilterRarity] = useState<string>('all')

    const earnedBadges = badges.filter(b => b.isEarned)
    const inProgressBadges = badges.filter(b => !b.isEarned && b.progress)
    const lockedBadges = badges.filter(b => !b.isEarned && !b.progress)

    const filteredBadges = badges.filter(badge => {
        if (filterCategory !== 'all' && badge.category !== filterCategory) return false
        if (filterRarity !== 'all' && badge.rarity !== filterRarity) return false
        return true
    })

    const categories = ['all', ...Array.from(new Set(badges.map(b => b.category)))]
    const rarities = ['all', 'common', 'rare', 'epic', 'legendary']

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card padding="md" className="text-center">
                    <p className="text-3xl font-bold text-green-600">{earnedBadges.length}</p>
                    <p className="text-sm text-gray-600">Earned</p>
                </Card>
                <Card padding="md" className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{inProgressBadges.length}</p>
                    <p className="text-sm text-gray-600">In Progress</p>
                </Card>
                <Card padding="md" className="text-center">
                    <p className="text-3xl font-bold text-gray-400">{lockedBadges.length}</p>
                    <p className="text-sm text-gray-600">Locked</p>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                <div className="flex gap-2">
                    <label className="text-sm font-medium text-gray-700">Category:</label>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-2 ml-4">
                    <label className="text-sm font-medium text-gray-700">Rarity:</label>
                    <select
                        value={filterRarity}
                        onChange={(e) => setFilterRarity(e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                        {rarities.map(rarity => (
                            <option key={rarity} value={rarity}>
                                {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Recently Earned */}
            {earnedBadges.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                        Recently Earned
                    </h3>
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {earnedBadges
                            .sort((a, b) => new Date(b.earnedAt!).getTime() - new Date(a.earnedAt!).getTime())
                            .slice(0, 5)
                            .map(badge => (
                                <BadgeCard
                                    key={badge.id}
                                    badge={badge}
                                    size="lg"
                                    onClick={() => setSelectedBadge(badge)}
                                />
                            ))
                        }
                    </div>
                </div>
            )}

            {/* In Progress */}
            {inProgressBadges.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        In Progress
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                        {inProgressBadges.map(badge => (
                            <BadgeCard
                                key={badge.id}
                                badge={badge}
                                onClick={() => setSelectedBadge(badge)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* All Badges Grid */}
            <div>
                <h3 className="text-lg font-semibold mb-4">
                    All Badges ({filteredBadges.length})
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {filteredBadges.map(badge => (
                        <BadgeCard
                            key={badge.id}
                            badge={badge}
                            size="sm"
                            onClick={() => setSelectedBadge(badge)}
                        />
                    ))}
                </div>
            </div>

            {/* Badge Detail Modal */}
            {selectedBadge && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    onClick={() => setSelectedBadge(null)}
                >
                    <Card
                        padding="lg"
                        className="max-w-md w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center space-y-4">
                            {/* Large Badge Icon */}
                            <div className="flex justify-center">
                                <BadgeCard badge={selectedBadge} size="lg" />
                            </div>

                            {/* Badge Info */}
                            <div>
                                <h2 className="text-2xl font-bold">{selectedBadge.name}</h2>
                                <p className="text-sm text-gray-600 uppercase tracking-wide">
                                    {selectedBadge.rarity} • {selectedBadge.category}
                                </p>
                            </div>

                            <p className="text-gray-700">{selectedBadge.description}</p>

                            {/* Progress */}
                            {!selectedBadge.isEarned && selectedBadge.progress && (
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>Progress</span>
                                        <span className="font-semibold">
                                            {selectedBadge.progress.current} / {selectedBadge.progress.required} {selectedBadge.progress.unit}
                                        </span>
                                    </div>
                                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 transition-all"
                                            style={{
                                                width: `${(selectedBadge.progress.current / selectedBadge.progress.required) * 100}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Rewards */}
                            {selectedBadge.mbReward > 0 && (
                                <div className="bg-yellow-50 p-3 rounded-lg">
                                    <p className="text-sm text-yellow-800">
                                        <strong>Reward:</strong> +{selectedBadge.mbReward} MB
                                    </p>
                                </div>
                            )}

                            {/* Perks */}
                            {selectedBadge.accessPerks && selectedBadge.accessPerks.length > 0 && (
                                <div className="text-left">
                                    <h4 className="font-semibold mb-2">Unlocks:</h4>
                                    <ul className="space-y-1">
                                        {selectedBadge.accessPerks.map((perk, idx) => (
                                            <li key={idx} className="text-sm flex items-start gap-2">
                                                <span className="text-green-500">✓</span>
                                                <span>{perk}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Earned Date */}
                            {selectedBadge.isEarned && selectedBadge.earnedAt && (
                                <p className="text-xs text-gray-500">
                                    Earned on {new Date(selectedBadge.earnedAt).toLocaleDateString()}
                                </p>
                            )}

                            {/* Pin/Unpin Button */}
                            {selectedBadge.isEarned && onPinBadge && (
                                <button
                                    onClick={() => onPinBadge(selectedBadge.id)}
                                    className={`
                                        px-4 py-2 rounded-lg font-medium transition-colors
                                        ${pinnedBadgeIds.includes(selectedBadge.id)
                                            ? 'bg-gray-200 text-gray-700'
                                            : 'bg-blue-500 text-white hover:bg-blue-600'
                                        }
                                    `}
                                >
                                    {pinnedBadgeIds.includes(selectedBadge.id) ? 'Unpin from Profile' : 'Pin to Profile'}
                                </button>
                            )}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
