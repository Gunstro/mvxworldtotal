// ============================================================================
// CARDS LAYOUT COMPONENT (Modern/Default) - ENHANCED WITH PROFILE COMPONENTS
// ============================================================================

import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    MapPin,
    LinkIcon as LinkIconLucide,
    Calendar,
    Settings,
    MoreHorizontal,
    BadgeCheck,
    Crown
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { Profile } from '@/types/database'
import { VisaBadge } from '@/components/profile/VisaBadge'
import { BadgeGallery, type Badge } from '@/components/profile/BadgeGallery'
import {
    CommunityStatsPanel, BraggingRightsPanel, type CommunityStats, type BraggingRights
} from '@/components/profile/CommunityStats'

interface CardsLayoutProps {
    profile: Profile & {
        follower_count?: number
        following_count?: number
        post_count?: number
    }
    isOwnProfile?: boolean
}

export function CardsLayout({ profile, isOwnProfile }: CardsLayoutProps) {
    const [isFollowing, setIsFollowing] = useState(false)

    const formatNumber = (num: number = 0) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
        return num.toString()
    }

    // Mock data (replace with real Supabase data later)
    const mockBadges: Badge[] = [
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
            badgeKey: 'team_of_25',
            name: 'Fabric Weaver',
            description: 'Weave a strong fabric of 25 volunteers',
            category: 'recruitment',
            rarity: 'rare',
            iconEmoji: '🌟',
            isEarned: false,
            mbReward: 500,
            progress: { current: 12, required: 25, unit: 'volunteers' },
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
        ],
        hallOfFamePositions: [
            { category: 'top_recruiters', rank: 12, period: 'this_month' },
            { category: 'fastest_growth', rank: 8, period: 'this_week' },
        ],
        topPerformerWeeks: 7,
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Cover Image */}
            <div className="relative h-40 sm:h-52 md:h-64 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 overflow-hidden">
                {profile.cover_url && (
                    <img
                        src={profile.cover_url}
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            </div>

            {/* Profile Content */}
            <div className="relative px-3 sm:px-4 md:px-6 -mt-16 sm:-mt-20">
                {/* Profile Card */}
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-white/20 p-4 sm:p-6">
                    {/* Avatar & Actions Row */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="relative -mt-14 sm:-mt-16">
                            <Avatar
                                src={profile.avatar_url}
                                size="xl"
                                className="ring-4 sm:ring-6 ring-white shadow-xl"
                            />
                            <div className="absolute bottom-1 right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full ring-3 ring-white" />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            {isOwnProfile ? (
                                <Link to="/settings">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        leftIcon={<Settings size={16} />}
                                        className="shadow-md hover:shadow-lg transition-all"
                                    >
                                        Edit Profile
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Button
                                        variant={isFollowing ? 'secondary' : 'primary'}
                                        size="sm"
                                        onClick={() => setIsFollowing(!isFollowing)}
                                        className="shadow-md hover:shadow-lg transition-all"
                                    >
                                        {isFollowing ? 'Following' : 'Follow'}
                                    </Button>
                                    <Button variant="secondary" size="sm" className="shadow-md hover:shadow-lg transition-all">
                                        Message
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                        <MoreHorizontal size={18} />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="mt-3 sm:mt-4">
                        {/* Name & Badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                {profile.display_name}
                            </h1>
                            {profile.is_verified && (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 rounded-full">
                                    <BadgeCheck size={14} className="text-blue-600" />
                                    <span className="text-[10px] font-semibold text-blue-600">Verified</span>
                                </div>
                            )}
                            {profile.verification_badge_type === 'gold' && (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full">
                                    <Crown size={14} className="text-white" />
                                    <span className="text-[10px] font-bold text-white">Premium</span>
                                </div>
                            )}
                        </div>

                        <p className="text-sm sm:text-base text-gray-500 mt-0.5">@{profile.username}</p>

                        {/* Bio */}
                        {profile.bio && (
                            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                                {profile.bio}
                            </p>
                        )}

                        {/* Meta Info */}
                        <div className="flex flex-wrap gap-2 mt-3 text-xs sm:text-sm text-gray-600">
                            {profile.location && (
                                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full">
                                    <MapPin size={14} className="text-gray-500" />
                                    <span className="font-medium">{profile.location}</span>
                                </span>
                            )}
                            {profile.website && (
                                <a
                                    href={profile.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
                                >
                                    <LinkIconLucide size={14} />
                                    <span className="font-medium">{profile.website.replace(/^https?:\/\//, '')}</span>
                                </a>
                            )}
                            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full">
                                <Calendar size={14} className="text-gray-500" />
                                <span className="font-medium">
                                    Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </span>
                            </span>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4">
                            <button className="group p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all hover:shadow-md">
                                <div className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    {formatNumber(profile.post_count)}
                                </div>
                                <div className="text-[10px] sm:text-xs font-medium text-gray-600 mt-0.5">Posts</div>
                            </button>
                            <button className="group p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all hover:shadow-md">
                                <div className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    {formatNumber(profile.follower_count)}
                                </div>
                                <div className="text-[10px] sm:text-xs font-medium text-gray-600 mt-0.5">Followers</div>
                            </button>
                            <button className="group p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all hover:shadow-md">
                                <div className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    {formatNumber(profile.following_count)}
                                </div>
                                <div className="text-[10px] sm:text-xs font-medium text-gray-600 mt-0.5">Following</div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* VISA Badge Section */}
                <div className="mt-6">
                    <Card padding="lg">
                        <div className="flex flex-col items-center">
                            <h2 className="text-xl font-bold mb-4">MegaVX VISA</h2>
                            <VisaBadge
                                tier="gold_vip_founder"
                                size="xl"
                                showName
                                showAdvantages
                            />
                        </div>
                    </Card>
                </div>

                {/* Community Stats */}
                <div className="mt-6">
                    <CommunityStatsPanel stats={mockCommunityStats} showDetails />
                </div>

                {/* Badge Gallery */}
                <div className="mt-6">
                    <Card padding="lg">
                        <h2 className="text-2xl font-bold mb-6">Achievement Gallery</h2>
                        <BadgeGallery
                            badges={mockBadges}
                            pinnedBadgeIds={['1', '2']}
                            onPinBadge={(id) => console.log('Pin badge:', id)}
                        />
                    </Card>
                </div>

                {/* Bragging Rights / Hall of Fame */}
                <div className="mt-6 mb-8">
                    <BraggingRightsPanel braggingRights={mockBraggingRights} />
                </div>
            </div>
        </div>
    )
}

export default CardsLayout
