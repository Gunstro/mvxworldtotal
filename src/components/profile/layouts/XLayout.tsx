// ============================================================================
// X (TWITTER) LAYOUT COMPONENT
// ============================================================================
// Twitter-style profile layout with clean feed design
// ============================================================================

import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    MapPin,
    LinkIcon,
    Calendar,
    MoreHorizontal
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import type { Profile } from '@/types/database'

interface XLayoutProps {
    profile: Profile & {
        follower_count?: number
        following_count?: number
        post_count?: number
    }
    isOwnProfile?: boolean
}

export function XLayout({ profile, isOwnProfile }: XLayoutProps) {
    const [isFollowing, setIsFollowing] = useState(false)
    const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'media' | 'likes'>('posts')

    const formatNumber = (num: number = 0) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
        return num.toString()
    }

    return (
        <div className="max-w-2xl mx-auto bg-white min-h-screen">
            {/* Header Banner */}
            <div className="relative h-48 bg-gray-300">
                {profile.cover_url && (
                    <img
                        src={profile.cover_url}
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                )}
            </div>

            {/* Profile Info Section */}
            <div className="px-4 pb-4">
                {/* Avatar & Action Button Row */}
                <div className="flex justify-between items-start -mt-16 mb-4">
                    <Avatar
                        src={profile.avatar_url}
                        size="2xl"
                        className="ring-4 ring-white"
                    />

                    {isOwnProfile ? (
                        <Link to="/settings" className="mt-16">
                            <Button variant="secondary" size="sm" className="rounded-full font-semibold">
                                Edit profile
                            </Button>
                        </Link>
                    ) : (
                        <div className="flex gap-2 mt-16">
                            <Button variant="ghost" size="sm" className="rounded-full">
                                <MoreHorizontal size={18} />
                            </Button>
                            <Button
                                variant={isFollowing ? 'secondary' : 'primary'}
                                size="sm"
                                onClick={() => setIsFollowing(!isFollowing)}
                                className="rounded-full font-semibold"
                            >
                                {isFollowing ? 'Following' : 'Follow'}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Name & Username */}
                <div className="mb-3">
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-1">
                        {profile.display_name || profile.username}
                        {profile.is_verified && (
                            <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </h1>
                    <p className="text-gray-500">@{profile.username}</p>
                </div>

                {/* Bio */}
                {profile.bio && (
                    <p className="text-gray-900 mb-3 whitespace-pre-line">
                        {profile.bio}
                    </p>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-3">
                    {profile.location && (
                        <span className="flex items-center gap-1">
                            <MapPin size={16} />
                            {profile.location}
                        </span>
                    )}
                    {profile.website && (
                        <a
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-500 hover:underline"
                        >
                            <LinkIcon size={16} />
                            {profile.website.replace(/^https?:\/\//, '')}
                        </a>
                    )}
                    <span className="flex items-center gap-1">
                        <Calendar size={16} />
                        Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                </div>

                {/* Following/Followers */}
                <div className="flex gap-4 text-sm mb-4">
                    <button className="hover:underline">
                        <span className="font-bold text-gray-900">{formatNumber(profile.following_count)}</span>
                        <span className="text-gray-500 ml-1">Following</span>
                    </button>
                    <button className="hover:underline">
                        <span className="font-bold text-gray-900">{formatNumber(profile.follower_count)}</span>
                        <span className="text-gray-500 ml-1">Followers</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    {[
                        { id: 'posts', label: 'Posts' },
                        { id: 'replies', label: 'Replies' },
                        { id: 'media', label: 'Media' },
                        { id: 'likes', label: 'Likes' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${activeTab === tab.id
                                ? 'text-gray-900'
                                : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="border-t border-gray-200">
                {activeTab === 'posts' && (
                    <div className="p-4 text-center text-gray-500">
                        <p>No posts yet</p>
                        <p className="text-sm mt-1">When they post, their posts will show up here.</p>
                    </div>
                )}
                {activeTab === 'replies' && (
                    <div className="p-4 text-center text-gray-500">
                        <p>No replies yet</p>
                    </div>
                )}
                {activeTab === 'media' && (
                    <div className="p-4 text-center text-gray-500">
                        <p>No media yet</p>
                    </div>
                )}
                {activeTab === 'likes' && (
                    <div className="p-4 text-center text-gray-500">
                        <p>No likes yet</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default XLayout
