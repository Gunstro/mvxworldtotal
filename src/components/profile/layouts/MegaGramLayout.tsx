// ============================================================================
// MEGAGRAM LAYOUT COMPONENT (Instagram-style)
// ============================================================================
// Visual-first photo grid layout for creators and influencers
// ============================================================================

import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    Settings,
    MoreHorizontal,
    Grid3x3,
    Bookmark,
    User,
    Play
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import type { Profile } from '@/types/database'

interface MegaGramLayoutProps {
    profile: Profile & {
        follower_count?: number
        following_count?: number
        post_count?: number
    }
    isOwnProfile?: boolean
}

export function MegaGramLayout({ profile, isOwnProfile }: MegaGramLayoutProps) {
    const [isFollowing, setIsFollowing] = useState(false)
    const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'tagged'>('posts')

    // Mock data - will be replaced with real posts from database
    const mockPosts = Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        image_url: `https://picsum.photos/400/400?random=${i}`,
        type: i % 4 === 0 ? 'video' : 'image',
        likes: Math.floor(Math.random() * 1000),
        comments: Math.floor(Math.random() * 100)
    }))

    const stories = [
        { id: 1, title: 'New', image: 'https://picsum.photos/100/100?random=story1' },
        { id: 2, title: 'Travel', image: 'https://picsum.photos/100/100?random=story2' },
        { id: 3, title: 'Food', image: 'https://picsum.photos/100/100?random=story3' },
    ]

    const formatNumber = (num: number = 0) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
        return num.toString()
    }

    return (
        <div className="max-w-4xl mx-auto bg-white min-h-screen">
            {/* Header Section */}
            <div className="p-4 md:p-8">
                {/* Profile Info Row */}
                <div className="flex items-start gap-4 md:gap-8 mb-6">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        <Avatar
                            src={profile.avatar_url}
                            size="2xl"
                            className="w-20 h-20 md:w-32 md:h-32"
                        />
                    </div>

                    {/* Info & Actions */}
                    <div className="flex-1">
                        {/* Username & Actions */}
                        <div className="flex items-center gap-3 mb-4">
                            <h1 className="text-xl md:text-2xl font-light">
                                {profile.username}
                            </h1>

                            {isOwnProfile ? (
                                <>
                                    <Link to="/settings">
                                        <Button variant="secondary" size="sm" className="font-semibold">
                                            Edit profile
                                        </Button>
                                    </Link>
                                    <Button variant="secondary" size="sm">
                                        <Settings size={16} />
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant={isFollowing ? 'secondary' : 'primary'}
                                        size="sm"
                                        onClick={() => setIsFollowing(!isFollowing)}
                                        className="font-semibold bg-blue-500 hover:bg-blue-600 text-white"
                                    >
                                        {isFollowing ? 'Following' : 'Follow'}
                                    </Button>
                                    <Button variant="secondary" size="sm" className="font-semibold">
                                        Message
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                        <MoreHorizontal size={20} />
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Stats Row - Desktop */}
                        <div className="hidden md:flex gap-8 mb-4">
                            <div className="text-center">
                                <span className="font-semibold text-sm">
                                    {formatNumber(profile.post_count)}
                                </span>
                                <span className="text-sm text-gray-600 ml-1">posts</span>
                            </div>
                            <button className="hover:opacity-70 transition-opacity">
                                <span className="font-semibold text-sm">
                                    {formatNumber(profile.follower_count)}
                                </span>
                                <span className="text-sm text-gray-600 ml-1">followers</span>
                            </button>
                            <button className="hover:opacity-70 transition-opacity">
                                <span className="font-semibold text-sm">
                                    {formatNumber(profile.following_count)}
                                </span>
                                <span className="text-sm text-gray-600 ml-1">following</span>
                            </button>
                        </div>

                        {/* Name & Bio - Desktop */}
                        <div className="hidden md:block">
                            <p className="font-semibold text-sm">{profile.display_name}</p>
                            {profile.bio && (
                                <p className="text-sm whitespace-pre-line mt-1">{profile.bio}</p>
                            )}
                            {profile.website && (
                                <a
                                    href={profile.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-900 font-semibold hover:underline"
                                >
                                    {profile.website.replace(/^https?:\/\//, '')}
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Name & Bio - Mobile */}
                <div className="md:hidden mb-4">
                    <p className="font-semibold text-sm">{profile.display_name}</p>
                    {profile.bio && (
                        <p className="text-sm whitespace-pre-line mt-1">{profile.bio}</p>
                    )}
                    {profile.website && (
                        <a
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-900 font-semibold hover:underline"
                        >
                            {profile.website.replace(/^https?:\/\//, '')}
                        </a>
                    )}
                </div>

                {/* Stories/Highlights */}
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {stories.map((story) => (
                        <button
                            key={story.id}
                            className="flex flex-col items-center gap-1 flex-shrink-0"
                        >
                            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-0.5">
                                <div className="w-full h-full rounded-full bg-white p-0.5">
                                    <img
                                        src={story.image}
                                        alt={story.title}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                </div>
                            </div>
                            <span className="text-xs text-gray-800">{story.title}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Row - Mobile */}
            <div className="md:hidden border-t border-b border-gray-200 py-3 px-4">
                <div className="flex justify-around text-center">
                    <div>
                        <p className="font-semibold text-sm">{formatNumber(profile.post_count)}</p>
                        <p className="text-xs text-gray-600">posts</p>
                    </div>
                    <div>
                        <p className="font-semibold text-sm">{formatNumber(profile.follower_count)}</p>
                        <p className="text-xs text-gray-600">followers</p>
                    </div>
                    <div>
                        <p className="font-semibold text-sm">{formatNumber(profile.following_count)}</p>
                        <p className="text-xs text-gray-600">following</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-t border-gray-200">
                <div className="flex justify-center">
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold tracking-wider border-t ${activeTab === 'posts'
                                ? 'border-gray-900 text-gray-900'
                                : 'border-transparent text-gray-400'
                            }`}
                    >
                        <Grid3x3 size={16} />
                        <span className="hidden sm:inline">POSTS</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('saved')}
                        className={`flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold tracking-wider border-t ${activeTab === 'saved'
                                ? 'border-gray-900 text-gray-900'
                                : 'border-transparent text-gray-400'
                            }`}
                    >
                        <Bookmark size={16} />
                        <span className="hidden sm:inline">SAVED</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('tagged')}
                        className={`flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold tracking-wider border-t ${activeTab === 'tagged'
                                ? 'border-gray-900 text-gray-900'
                                : 'border-transparent text-gray-400'
                            }`}
                    >
                        <User size={16} />
                        <span className="hidden sm:inline">TAGGED</span>
                    </button>
                </div>
            </div>

            {/* Photo Grid */}
            <div className="grid grid-cols-3 gap-1">
                {mockPosts.map((post) => (
                    <button
                        key={post.id}
                        className="relative aspect-square bg-gray-100 hover:opacity-75 transition-opacity group"
                    >
                        <img
                            src={post.image_url}
                            alt={`Post ${post.id}`}
                            className="w-full h-full object-cover"
                        />
                        {post.type === 'video' && (
                            <div className="absolute top-2 right-2">
                                <Play size={20} className="text-white drop-shadow-lg" fill="white" />
                            </div>
                        )}
                        {/* Hover overlay with stats */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-semibold">
                            <span className="flex items-center gap-1">
                                ❤️ {formatNumber(post.likes)}
                            </span>
                            <span className="flex items-center gap-1">
                                💬 {formatNumber(post.comments)}
                            </span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Empty state if no posts */}
            {mockPosts.length === 0 && (
                <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-gray-900 flex items-center justify-center">
                        <Grid3x3 size={32} className="text-gray-900" />
                    </div>
                    <h3 className="text-2xl font-light mb-2">No Posts Yet</h3>
                    <p className="text-gray-600">
                        {isOwnProfile ? 'Start sharing photos to see them here' : 'No posts to show'}
                    </p>
                </div>
            )}
        </div>
    )
}

export default MegaGramLayout
