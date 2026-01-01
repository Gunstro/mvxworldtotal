import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { VisaBadge, VisaTierComparison, VISA_TIERS } from '@/components/profile/VisaBadge'
import { BadgeGallery, type Badge } from '@/components/profile/BadgeGallery'
import { CommunityStatsPanel, BraggingRightsPanel, type CommunityStats, type BraggingRights } from '@/components/profile/CommunityStats'

// Mock data
const mockBadges: Badge[] = [
    // Earned badges
    {
        id: '1',
        badgeKey: 'first_recruit',
        name: 'First Volunteer',
        description: 'Welcome your first community member!',
        category: 'recruitment',
        rarity: 'common',
        iconEmoji: '🎯',
        isEarned: true,
        earnedAt: '2024-01-15',
        mbReward: 50,
        accessPerks: ['Early Starter Title'],
    },
    {
        id: '2',
        badgeKey: 'team_of_10',
        name: 'Community Leader',
        description: 'Lead a community of 10 members',
        category: 'recruitment',
        rarity: 'rare',
        iconEmoji: '🏆',
        isEarned: true,
        earnedAt: '2024-02-20',
        mbReward: 250,
        accessPerks: ['Priority Support Access'],
    },
    {
        id: '3',
        badgeKey: 'first_1k',
        name: '£1K Earner',
        description: 'Earned your first £1,000!',
        category: 'earning',
        rarity: 'rare',
        iconEmoji: '💸',
        isEarned: true,
        earnedAt: '2024-03-10',
        mbReward: 100,
    },
    {
        id: '4',
        badgeKey: 'week_streak',
        name: '7-Day Streak',
        description: 'Logged in for 7 consecutive days',
        category: 'activity',
        rarity: 'common',
        iconEmoji: '🔥',
        isEarned: true,
        earnedAt: '2024-01-22',
        mbReward: 50,
    },
    // In progress badges
    {
        id: '5',
        badgeKey: 'team_of_25',
        name: 'Fabric Weaver',
        description: 'Weave a strong fabric of 25 volunteers',
        category: 'recruitment',
        rarity: 'rare',
        iconEmoji: '🌟',
        isEarned: false,
        mbReward: 500,
        progress: {
            current: 17,
            required: 25,
            unit: 'volunteers',
        },
        accessPerks: ['Exclusive Badge Frame'],
    },
    {
        id: '6',
        badgeKey: 'first_5k',
        name: '£5K Club',
        description: 'Member of the £5,000 earnings club',
        category: 'earning',
        rarity: 'epic',
        iconEmoji: '💎',
        isEarned: false,
        mbReward: 500,
        progress: {
            current: 3200,
            required: 5000,
            unit: '£',
        },
    },
    {
        id: '7',
        badgeKey: 'month_streak',
        name: '30-Day Dedication',
        description: 'Logged in for 30 consecutive days!',
        category: 'activity',
        rarity: 'rare',
        iconEmoji: '⚡',
        isEarned: false,
        mbReward: 250,
        progress: {
            current: 18,
            required: 30,
            unit: 'days',
        },
    },
    // Locked badges
    {
        id: '8',
        badgeKey: 'century_club',
        name: 'Century Club',
        description: 'The prestigious 100-member milestone',
        category: 'recruitment',
        rarity: 'legendary',
        iconEmoji: '💎',
        isEarned: false,
        mbReward: 5000,
        accessPerks: ['Century Club Title', 'Verified Badge', 'Exclusive Events'],
    },
    {
        id: '9',
        badgeKey: 'first_10k',
        name: '£10K Legend',
        description: 'Legendary £10,000 earnings achieved!',
        category: 'earning',
        rarity: 'legendary',
        iconEmoji: '🏅',
        isEarned: false,
        mbReward: 1000,
    },
    {
        id: '10',
        badgeKey: 'year_streak',
        name: 'Year of Commitment',
        description: '365 days of consecutive logins!!!',
        category: 'activity',
        rarity: 'legendary',
        iconEmoji: '🎖️',
        isEarned: false,
        mbReward: 5000,
    },
]

const mockCommunityStats: CommunityStats = {
    totalMembers: 347,
    activeVolunteers: 142,
    fabricDepth: 8,
    monthlyGrowth: 23.5,
    communityRank: 47,
    fabricStrength: 78,
}

const mockBraggingRights: BraggingRights = {
    title: 'Community Champion',
    achievements: [
        'Built a community of 300+ members in 3 months',
        'Helped 50+ volunteers earn their first £100',
        'Maintained 7-week Top 100 streak',
    ],
    hallOfFamePositions: [
        {
            category: 'top_recruiters',
            rank: 12,
            period: 'this_month',
        },
        {
            category: 'fastest_growth',
            rank: 8,
            period: 'this_week',
        },
        {
            category: 'community_builders',
            rank: 23,
            period: 'all_time',
        },
    ],
    topPerformerWeeks: 7,
}

export function ProfileDemoPage() {
    const [selectedVisa, setSelectedVisa] = useState('gold_vip_founder')
    const visaTiers = Object.keys(VISA_TIERS)

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 space-y-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        🎨 Profile Components Demo
                    </h1>
                    <p className="text-gray-600">
                        Preview all the new profile components with mock data
                    </p>
                </div>

                {/* VISA Badge Showcase */}
                <section>
                    <Card padding="lg">
                        <h2 className="text-2xl font-bold mb-6">1. VISA Badge System</h2>

                        {/* VISA Selector */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select VISA Tier:
                            </label>
                            <select
                                value={selectedVisa}
                                onChange={(e) => setSelectedVisa(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg"
                            >
                                {visaTiers.map(tier => (
                                    <option key={tier} value={tier}>
                                        {VISA_TIERS[tier].name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Badge with advantages */}
                            <div>
                                <h3 className="font-semibold mb-4">Badge with Advantages:</h3>
                                <VisaBadge
                                    tier={selectedVisa}
                                    size="xl"
                                    showName
                                    showAdvantages
                                />
                            </div>

                            {/* All sizes */}
                            <div>
                                <h3 className="font-semibold mb-4">All Sizes:</h3>
                                <div className="flex items-end gap-6">
                                    <VisaBadge tier={selectedVisa} size="sm" />
                                    <VisaBadge tier={selectedVisa} size="md" />
                                    <VisaBadge tier={selectedVisa} size="lg" />
                                    <VisaBadge tier={selectedVisa} size="xl" />
                                </div>
                            </div>
                        </div>

                        {/* Tier Progression */}
                        <div className="mt-8 pt-8 border-t">
                            <h3 className="font-semibold mb-4">Tier Progression:</h3>
                            <VisaTierComparison currentTier={selectedVisa} />
                        </div>
                    </Card>
                </section>

                {/* Badge Gallery */}
                <section>
                    <Card padding="lg">
                        <h2 className="text-2xl font-bold mb-6">2. Achievement Badge Gallery</h2>
                        <BadgeGallery
                            badges={mockBadges}
                            pinnedBadgeIds={['1', '2']}
                            onPinBadge={(id) => console.log('Pin badge:', id)}
                        />
                    </Card>
                </section>

                {/* Community Stats */}
                <section>
                    <Card padding="lg">
                        <h2 className="text-2xl font-bold mb-6">3. Community Statistics</h2>
                        <CommunityStatsPanel stats={mockCommunityStats} showDetails />
                    </Card>
                </section>

                {/* Bragging Rights */}
                <section>
                    <h2 className="text-2xl font-bold mb-4">4. Bragging Rights / Hall of Fame</h2>
                    <BraggingRightsPanel braggingRights={mockBraggingRights} />
                </section>

                {/* Info Footer */}
                <Card padding="lg" className="bg-blue-50 border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">✨ Components Ready!</h3>
                    <p className="text-sm text-blue-800 mb-4">
                        All components are built with mock data. Next steps:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                        <li>Run database migration (20250128_profile_enhancements.sql)</li>
                        <li>Integrate components into ProfilePage.tsx</li>
                        <li>Connect to real Supabase data</li>
                        <li>Add MegaTube layout (YouTube-style)</li>
                        <li>Build wallet system with advertising agent module</li>
                    </ul>
                </Card>
            </div>
        </div>
    )
}
