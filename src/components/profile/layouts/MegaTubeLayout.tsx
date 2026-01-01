import { useState } from 'react'
import {
    Play,
    ThumbsUp,
    Eye,
    Clock,
    Share2,
    MoreVertical,
    Bell,
    BellOff,
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { Profile } from '@/types/database'

interface Video {
    id: string
    title: string
    thumbnail: string
    views: number
    uploadedAt: string
    duration: string
    likes: number
}

interface Playlist {
    id: string
    name: string
    videoCount: number
    thumbnail: string
}

interface MegaTubeLayoutProps {
    profile: Profile
    isOwnProfile: boolean
}

export function MegaTubeLayout({ profile, isOwnProfile }: MegaTubeLayoutProps) {
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [activeTab, setActiveTab] = useState<'videos' | 'playlists' | 'about'>('videos')

    // Mock data
    const subscriberCount = 12450
    const videoCount = 87

    const videos: Video[] = [
        {
            id: '1',
            title: 'How I Built My MegaVX Community to 300+ Members',
            thumbnail: 'https://picsum.photos/320/180?random=1',
            views: 12450,
            uploadedAt: '2024-01-15',
            duration: '12:34',
            likes: 1240,
        },
        {
            id: '2',
            title: 'MegaVX Success Story: From £0 to £10K in 3 Months',
            thumbnail: 'https://picsum.photos/320/180?random=2',
            views: 8723,
            uploadedAt: '2024-01-20',
            duration: '8:22',
            likes: 890,
        },
        {
            id: '3',
            title: 'My Top 5 Tips for Growing Your Community Fabric',
            thumbnail: 'https://picsum.photos/320/180?random=3',
            views: 15670,
            uploadedAt: '2024-02-01',
            duration: '15:47',
            likes: 1567,
        },
        {
            id: '4',
            title: 'VISA Tier Explained: Which One Is Right For You?',
            thumbnail: 'https://picsum.photos/320/180?random=4',
            views: 9834,
            uploadedAt: '2024-02-10',
            duration: '10:15',
            likes: 1023,
        },
    ]

    const playlists: Playlist[] = [
        {
            id: '1',
            name: 'MegaVX Getting Started',
            videoCount: 12,
            thumbnail: 'https://picsum.photos/320/180?random=10',
        },
        {
            id: '2',
            name: 'Success Stories',
            videoCount: 8,
            thumbnail: 'https://picsum.photos/320/180?random=11',
        },
        {
            id: '3',
            name: 'Weekly Updates',
            videoCount: 24,
            thumbnail: 'https://picsum.photos/320/180?random=12',
        },
    ]

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
        return num.toString()
    }

    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - date.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 1) return '1 day ago'
        if (diffDays < 7) return `${diffDays} days ago`
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
        return `${Math.floor(diffDays / 365)} years ago`
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Channel Banner */}
            <div className="relative h-32 md:h-48 bg-gradient-to-r from-red-500 to-pink-500 overflow-hidden">
                {profile.cover_url && (
                    <img
                        src={profile.cover_url}
                        alt="Channel banner"
                        className="w-full h-full object-cover"
                    />
                )}
            </div>

            {/* Channel Header */}
            <div className="max-w-7xl mx-auto px-4">
                <div className="bg-white border-b">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 py-4">
                        {/* Avatar & Info */}
                        <div className="flex items-start gap-4">
                            <Avatar
                                src={profile.avatar_url || ''}
                                alt={profile.display_name || profile.username}
                                size="xl"
                                className="ring-4 ring-white shadow-lg"
                            />

                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {profile.display_name || profile.username}
                                </h1>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                    <span>@{profile.username}</span>
                                    <span>•</span>
                                    <span>{formatNumber(subscriberCount)} subscribers</span>
                                    <span>•</span>
                                    <span>{videoCount} videos</span>
                                </div>
                                {profile.bio && (
                                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                                        {profile.bio}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Subscribe Button */}
                        <div className="flex gap-2 md:ml-auto">
                            {!isOwnProfile && (
                                <>
                                    <Button
                                        variant={isSubscribed ? 'secondary' : 'primary'}
                                        onClick={() => setIsSubscribed(!isSubscribed)}
                                        leftIcon={isSubscribed ? <Bell size={18} /> : <BellOff size={18} />}
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                        {isSubscribed ? 'Subscribed' : 'Subscribe'}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-8 border-t">
                        <button
                            onClick={() => setActiveTab('videos')}
                            className={`px-4 py-3 border-b-2 font-medium transition-colors ${activeTab === 'videos'
                                    ? 'border-red-600 text-red-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Videos
                        </button>
                        <button
                            onClick={() => setActiveTab('playlists')}
                            className={`px-4 py-3 border-b-2 font-medium transition-colors ${activeTab === 'playlists'
                                    ? 'border-red-600 text-red-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Playlists
                        </button>
                        <button
                            onClick={() => setActiveTab('about')}
                            className={`px-4 py-3 border-b-2 font-medium transition-colors ${activeTab === 'about'
                                    ? 'border-red-600 text-red-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            About
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {activeTab === 'videos' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {videos.map((video) => (
                            <Card key={video.id} padding="none" className="cursor-pointer hover:shadow-lg transition-shadow">
                                {/* Thumbnail */}
                                <div className="relative">
                                    <img
                                        src={video.thumbnail}
                                        alt={video.title}
                                        className="w-full aspect-video object-cover rounded-t-lg"
                                    />
                                    {/* Duration */}
                                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                                        {video.duration}
                                    </div>
                                    {/* Play overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-30 rounded-t-lg">
                                        <div className="bg-red-600 rounded-full p-3">
                                            <Play className="w-8 h-8 text-white fill-white" />
                                        </div>
                                    </div>
                                </div>

                                {/* Video Info */}
                                <div className="p-3">
                                    <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                                        {video.title}
                                    </h3>

                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <Eye size={14} />
                                            <span>{formatNumber(video.views)} views</span>
                                        </div>
                                        <span>•</span>
                                        <div className="flex items-center gap-1">
                                            <Clock size={14} />
                                            <span>{formatDate(video.uploadedAt)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <ThumbsUp size={14} />
                                            <span>{formatNumber(video.likes)}</span>
                                        </div>
                                        <button className="hover:text-gray-900 transition-colors">
                                            <Share2 size={14} />
                                        </button>
                                        <button className="hover:text-gray-900 transition-colors ml-auto">
                                            <MoreVertical size={14} />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {activeTab === 'playlists' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {playlists.map((playlist) => (
                            <Card key={playlist.id} padding="none" className="cursor-pointer hover:shadow-lg transition-shadow">
                                <div className="relative">
                                    <img
                                        src={playlist.thumbnail}
                                        alt={playlist.name}
                                        className="w-full aspect-video object-cover rounded-t-lg"
                                    />
                                    {/* Playlist overlay */}
                                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-t-lg">
                                        <div className="text-center text-white">
                                            <Play className="w-12 h-12 mx-auto mb-2" />
                                            <p className="text-sm font-semibold">{playlist.videoCount} videos</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3">
                                    <h3 className="font-semibold text-sm">
                                        {playlist.name}
                                    </h3>
                                    <p className="text-xs text-gray-600 mt-1">
                                        View full playlist
                                    </p>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {activeTab === 'about' && (
                    <Card padding="lg" className="max-w-3xl">
                        <h2 className="text-xl font-bold mb-4">About</h2>

                        <div className="space-y-4">
                            {profile.bio && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                                    <p className="text-gray-700 whitespace-pre-line">{profile.bio}</p>
                                </div>
                            )}

                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Channel Stats</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Subscribers</p>
                                        <p className="text-lg font-bold">{formatNumber(subscriberCount)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Videos</p>
                                        <p className="text-lg font-bold">{videoCount}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Joined</p>
                                        <p className="text-lg font-bold">
                                            {new Date(profile.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {profile.location && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                                    <p className="text-gray-700">{profile.location}</p>
                                </div>
                            )}

                            {profile.website && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Links</h3>
                                    <a
                                        href={profile.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        {profile.website}
                                    </a>
                                </div>
                            )}
                        </div>
                    </Card>
                )}
            </div>
        </div>
    )
}
