// ============================================================================
// MEGABOOK LAYOUT COMPONENT (Facebook-style)
// ============================================================================
// Timeline-based social layout with rich content cards
// ============================================================================

import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    MapPin,
    Heart,
    MessageCircle,
    Share2,
    Camera,
    Video,
    Calendar,
    Users,
    Briefcase,
    GraduationCap,
    Home,
    Settings,
    MoreHorizontal,
    Globe
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import type { Profile } from '@/types/database'

interface MegaBookLayoutProps {
    profile: Profile & {
        follower_count?: number
        following_count?: number
        post_count?: number
    }
    isOwnProfile?: boolean
}

export function MegaBookLayout({ profile, isOwnProfile }: MegaBookLayoutProps) {
    const [isFollowing, setIsFollowing] = useState(false)
    const [activeSection, setActiveSection] = useState<'timeline' | 'about' | 'friends' | 'photos'>('timeline')

    // Mock timeline posts
    const timelinePosts = [
        {
            id: 1,
            type: 'status',
            content: 'Excited to announce the launch of MegaVX World! 🚀',
            timestamp: '2 hours ago',
            likes: 45,
            comments: 12,
            shares: 5
        },
        {
            id: 2,
            type: 'photo',
            content: 'Amazing sunset at the beach today! 🌅',
            photos: ['https://picsum.photos/600/400?random=1'],
            timestamp: '5 hours ago',
            likes: 89,
            comments: 23,
            shares: 7
        },
        {
            id: 3,
            type: 'life_event',
            event: 'Started a new position as CEO at MegaVX',
            icon: Briefcase,
            timestamp: '1 week ago',
            likes: 234,
            comments: 45
        }
    ]

    const friends = [
        { id: 1, name: 'John Doe', avatar: 'https://picsum.photos/100/100?random=f1', mutualFriends: 45 },
        { id: 2, name: 'Jane Smith', avatar: 'https://picsum.photos/100/100?random=f2', mutualFriends: 23 },
        { id: 3, name: 'Bob Johnson', avatar: 'https://picsum.photos/100/100?random=f3', mutualFriends: 67 },
        { id: 4, name: 'Alice Brown', avatar: 'https://picsum.photos/100/100?random=f4', mutualFriends: 12 },
        { id: 5, name: 'Charlie Wilson', avatar: 'https://picsum.photos/100/100?random=f5', mutualFriends: 89 },
        { id: 6, name: 'Diana Lee', avatar: 'https://picsum.photos/100/100?random=f6', mutualFriends: 34 },
    ]

    const photos = Array.from({ length: 9 }, (_, i) => ({
        id: i + 1,
        url: `https://picsum.photos/300/300?random=${i + 10}`
    }))

    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Cover Photo */}
            <div className="bg-white">
                <div className="relative h-96 bg-gradient-to-r from-blue-400 to-blue-600">
                    {profile.cover_url && (
                        <img
                            src={profile.cover_url}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                    )}
                    {isOwnProfile && (
                        <button className="absolute bottom-4 right-4 px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 flex items-center gap-2">
                            <Camera size={16} />
                            <span className="text-sm font-semibold">Edit cover photo</span>
                        </button>
                    )}
                </div>

                {/* Profile Header */}
                <div className="max-w-5xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 -mt-8 pb-4">
                        {/* Avatar & Name */}
                        <div className="flex flex-col md:flex-row md:items-end gap-4">
                            <div className="relative">
                                <Avatar
                                    src={profile.avatar_url}
                                    size="2xl"
                                    className="w-40 h-40 ring-4 ring-white"
                                />
                                {isOwnProfile && (
                                    <button className="absolute bottom-0 right-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300">
                                        <Camera size={18} />
                                    </button>
                                )}
                            </div>
                            <div className="pb-2">
                                <h1 className="text-3xl font-bold text-gray-900">{profile.display_name}</h1>
                                <p className="text-gray-600">{profile.follower_count || 0} friends</p>
                                <div className="flex -space-x-2 mt-2">
                                    {friends.slice(0, 8).map((friend, i) => (
                                        <img
                                            key={friend.id}
                                            src={friend.avatar}
                                            alt={friend.name}
                                            className="w-8 h-8 rounded-full border-2 border-white"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pb-2">
                            {isOwnProfile ? (
                                <>
                                    <Button variant="primary" size="md" leftIcon={<Camera size={18} />}>
                                        Add to Story
                                    </Button>
                                    <Link to="/settings">
                                        <Button variant="secondary" size="md" leftIcon={<Settings size={18} />}>
                                            Edit Profile
                                        </Button>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant={isFollowing ? 'secondary' : 'primary'}
                                        size="md"
                                        onClick={() => setIsFollowing(!isFollowing)}
                                        leftIcon={<Users size={18} />}
                                    >
                                        {isFollowing ? 'Friends' : 'Add Friend'}
                                    </Button>
                                    <Button variant="secondary" size="md" leftIcon={<MessageCircle size={18} />}>
                                        Message
                                    </Button>
                                    <Button variant="ghost" size="md">
                                        <MoreHorizontal size={18} />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="border-t border-gray-300">
                        <div className="flex gap-2">
                            {[
                                { id: 'timeline', label: 'Timeline', icon: Home },
                                { id: 'about', label: 'About', icon: Users },
                                { id: 'friends', label: 'Friends', icon: Users },
                                { id: 'photos', label: 'Photos', icon: Camera },
                            ].map((tab) => {
                                const Icon = tab.icon
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveSection(tab.id as any)}
                                        className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-4 transition-colors ${activeSection === tab.id
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Icon size={16} />
                                        {tab.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 py-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Left Sidebar - Intro */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-4 mb-4">
                            <h2 className="text-xl font-bold mb-4">Intro</h2>
                            {profile.bio && (
                                <p className="text-gray-700 text-center mb-4">{profile.bio}</p>
                            )}
                            <div className="space-y-3">
                                {profile.location && (
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <MapPin size={20} className="text-gray-500" />
                                        <span>Lives in <strong>{profile.location}</strong></span>
                                    </div>
                                )}
                                {profile.website && (
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Globe size={20} className="text-gray-500" />
                                        <a href={profile.website} className="text-blue-600 hover:underline">
                                            {profile.website.replace(/^https?:\/\//, '')}
                                        </a>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Calendar size={20} className="text-gray-500" />
                                    <span>Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Photos Preview */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold">Photos</h2>
                                <button className="text-blue-600 hover:underline text-sm">See all</button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {photos.slice(0, 9).map((photo) => (
                                    <img
                                        key={photo.id}
                                        src={photo.url}
                                        alt="Photo"
                                        className="w-full aspect-square object-cover rounded-lg hover:opacity-75 cursor-pointer"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Friends Preview */}
                        <div className="bg-white rounded-lg shadow p-4 mt-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold">Friends</h2>
                                <button className="text-blue-600 hover:underline text-sm">See all</button>
                            </div>
                            <p className="text-gray-600 text-sm mb-3">{profile.follower_count || 0} friends</p>
                            <div className="grid grid-cols-3 gap-2">
                                {friends.slice(0, 6).map((friend) => (
                                    <div key={friend.id} className="text-center">
                                        <img
                                            src={friend.avatar}
                                            alt={friend.name}
                                            className="w-full aspect-square object-cover rounded-lg mb-1"
                                        />
                                        <p className="text-xs font-semibold truncate">{friend.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Timeline */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Create Post (Own Profile Only) */}
                        {isOwnProfile && (
                            <div className="bg-white rounded-lg shadow p-4">
                                <div className="flex gap-3 items-center mb-3">
                                    <Avatar src={profile.avatar_url} size="md" />
                                    <input
                                        type="text"
                                        placeholder="What's on your mind?"
                                        className="flex-1 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 cursor-pointer"
                                    />
                                </div>
                                <div className="flex gap-2 pt-3 border-t">
                                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg">
                                        <Video size={20} className="text-red-500" />
                                        <span className="text-sm font-semibold">Live video</span>
                                    </button>
                                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg">
                                        <Camera size={20} className="text-green-500" />
                                        <span className="text-sm font-semibold">Photo/video</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Timeline Posts */}
                        {timelinePosts.map((post) => (
                            <div key={post.id} className="bg-white rounded-lg shadow">
                                {/* Post Header */}
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar src={profile.avatar_url} size="md" />
                                        <div>
                                            <p className="font-semibold">{profile.display_name}</p>
                                            <p className="text-xs text-gray-500">{post.timestamp}</p>
                                        </div>
                                    </div>
                                    <button className="p-2 hover:bg-gray-100 rounded-full">
                                        <MoreHorizontal size={20} />
                                    </button>
                                </div>

                                {/* Post Content */}
                                {post.type === 'life_event' && post.icon && (
                                    <div className="px-4 pb-3 flex items-center gap-3 text-gray-700">
                                        <post.icon size={20} className="text-blue-600" />
                                        <span className="font-semibold">{post.event}</span>
                                    </div>
                                )}

                                {post.content && (
                                    <div className="px-4 pb-3">
                                        <p className="text-gray-900">{post.content}</p>
                                    </div>
                                )}

                                {/* Photos */}
                                {post.photos && (
                                    <div className="mb-3">
                                        <img
                                            src={post.photos[0]}
                                            alt="Post"
                                            className="w-full object-cover"
                                        />
                                    </div>
                                )}

                                {/* Engagement Stats */}
                                <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-600 border-t border-b">
                                    <span>❤️ {post.likes} Likes</span>
                                    <div className="flex gap-4">
                                        <span>{post.comments} Comments</span>
                                        {post.shares && <span>{post.shares} Shares</span>}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="p-2 flex gap-1">
                                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg">
                                        <Heart size={20} />
                                        <span className="font-semibold">Like</span>
                                    </button>
                                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg">
                                        <MessageCircle size={20} />
                                        <span className="font-semibold">Comment</span>
                                    </button>
                                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg">
                                        <Share2 size={20} />
                                        <span className="font-semibold">Share</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MegaBookLayout
