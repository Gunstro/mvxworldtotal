import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    Search,
    TrendingUp,
    Users,
    Hash,
    Image,
    Video,
    BadgeCheck,
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

type TabType = 'trending' | 'people' | 'hashtags' | 'photos' | 'videos'

interface TrendingTopic {
    id: string
    tag: string
    posts_count: number
    is_rising: boolean
}

interface SuggestedUser {
    id: string
    username: string
    display_name: string
    avatar_url: string
    bio: string
    is_verified: boolean
    follower_count: number
    is_following: boolean
}

const trendingTopics: TrendingTopic[] = [
    { id: '1', tag: 'MegaVX', posts_count: 12500, is_rising: true },
    { id: '2', tag: 'PassiveIncome', posts_count: 8900, is_rising: true },
    { id: '3', tag: 'CryptoLife', posts_count: 7800, is_rising: false },
    { id: '4', tag: 'DigitalNomad', posts_count: 6500, is_rising: true },
    { id: '5', tag: 'SideHustle', posts_count: 5200, is_rising: false },
    { id: '6', tag: 'BuildingWealth', posts_count: 4800, is_rising: true },
    { id: '7', tag: 'Entrepreneurship', posts_count: 4200, is_rising: false },
    { id: '8', tag: 'FinancialFreedom', posts_count: 3900, is_rising: true },
]

const suggestedUsers: SuggestedUser[] = [
    {
        id: '1',
        username: 'emma_wilson',
        display_name: 'Emma Wilson',
        avatar_url: 'https://i.pravatar.cc/150?img=5',
        bio: 'Travel blogger | MegaVX Ambassador | 50+ countries',
        is_verified: true,
        follower_count: 125000,
        is_following: false,
    },
    {
        id: '2',
        username: 'david_chen',
        display_name: 'David Chen',
        avatar_url: 'https://i.pravatar.cc/150?img=12',
        bio: 'Tech entrepreneur | Building the future of social',
        is_verified: true,
        follower_count: 89000,
        is_following: false,
    },
    {
        id: '3',
        username: 'sarah_j',
        display_name: 'Sarah Johnson',
        avatar_url: 'https://i.pravatar.cc/150?img=1',
        bio: 'Digital creator | Earned £50K+ on MegaVX',
        is_verified: true,
        follower_count: 67000,
        is_following: true,
    },
    {
        id: '4',
        username: 'mike_torres',
        display_name: 'Michael Torres',
        avatar_url: 'https://i.pravatar.cc/150?img=8',
        bio: 'Investor | Community builder | Matrix leader',
        is_verified: true,
        follower_count: 45000,
        is_following: false,
    },
]

const mockPhotos = Array.from({ length: 12 }, (_, i) => ({
    id: `photo-${i}`,
    url: `https://picsum.photos/400/400?random=${i}`,
    likes: Math.floor(Math.random() * 1000),
}))

export function ExplorePage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTab, setActiveTab] = useState<TabType>('trending')
    const [users, setUsers] = useState(suggestedUsers)

    const toggleFollow = (userId: string) => {
        setUsers(users.map((u) =>
            u.id === userId ? { ...u, is_following: !u.is_following } : u
        ))
    }

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
        return num.toString()
    }

    const tabs: { id: TabType; icon: React.ElementType; label: string }[] = [
        { id: 'trending', icon: TrendingUp, label: 'Trending' },
        { id: 'people', icon: Users, label: 'People' },
        { id: 'hashtags', icon: Hash, label: 'Hashtags' },
        { id: 'photos', icon: Image, label: 'Photos' },
        { id: 'videos', icon: Video, label: 'Videos' },
    ]

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search MegaVX..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-2 mb-6 -mx-4 px-4">
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors
                ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }
              `}
                        >
                            <Icon size={18} />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Content */}
            {activeTab === 'trending' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">What's Trending</h2>
                    <Card padding="none">
                        <div className="divide-y divide-gray-100">
                            {trendingTopics.map((topic, index) => (
                                <Link
                                    key={topic.id}
                                    to={`/hashtag/${topic.tag}`}
                                    className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <span className="text-lg font-bold text-gray-400 w-6">
                                        {index + 1}
                                    </span>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900">#{topic.tag}</span>
                                            {topic.is_rising && (
                                                <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                                    <TrendingUp size={12} />
                                                    Rising
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {formatNumber(topic.posts_count)} posts
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'people' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">People to Follow</h2>
                    <div className="grid gap-4">
                        {users.map((user) => (
                            <Card key={user.id} padding="md">
                                <div className="flex items-start gap-3">
                                    <Link to={`/profile/${user.username}`}>
                                        <Avatar src={user.avatar_url} size="lg" />
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <Link
                                                to={`/profile/${user.username}`}
                                                className="font-semibold text-gray-900 hover:underline"
                                            >
                                                {user.display_name}
                                            </Link>
                                            {user.is_verified && (
                                                <BadgeCheck size={16} className="text-blue-500" />
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">@{user.username}</p>
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{user.bio}</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {formatNumber(user.follower_count)} followers
                                        </p>
                                    </div>
                                    <Button
                                        variant={user.is_following ? 'secondary' : 'primary'}
                                        size="sm"
                                        onClick={() => toggleFollow(user.id)}
                                    >
                                        {user.is_following ? 'Following' : 'Follow'}
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'hashtags' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Popular Hashtags</h2>
                    <div className="flex flex-wrap gap-2">
                        {trendingTopics.map((topic) => (
                            <Link
                                key={topic.id}
                                to={`/hashtag/${topic.tag}`}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <Hash size={16} className="text-gray-500" />
                                <span className="font-medium text-gray-700">{topic.tag}</span>
                                <span className="text-sm text-gray-500">
                                    {formatNumber(topic.posts_count)}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'photos' && (
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Photos</h2>
                    <div className="grid grid-cols-3 gap-1 md:gap-2">
                        {mockPhotos.map((photo) => (
                            <div
                                key={photo.id}
                                className="aspect-square bg-gray-200 rounded-lg overflow-hidden relative group cursor-pointer"
                            >
                                <img
                                    src={photo.url}
                                    alt=""
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white font-medium">❤️ {photo.likes}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'videos' && (
                <div className="text-center py-12">
                    <Video size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">Videos coming soon!</p>
                </div>
            )}
        </div>
    )
}
