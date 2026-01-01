import { useState, useEffect } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import {
    MapPin,
    LinkIcon,
    Calendar,
    BadgeCheck,
    Settings,
    MoreHorizontal,
    Grid3X3,
    Bookmark,
    Heart,
    Coins,
    TrendingUp,
    Crown,
    Loader2,
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PostCard } from '@/components/posts/PostCard'
import { useProfile } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import type { Profile, FeedPost } from '@/types/database'

// Layout components
import { LayoutSwitcher } from '@/components/profile/layouts/LayoutSwitcher'
import { CardsLayout } from '@/components/profile/layouts/CardsLayout'
import { XLayout } from '@/components/profile/layouts/XLayout'
import { LinkedInLayout } from '@/components/profile/layouts/LinkedInLayout'
import { MegaGramLayout } from '@/components/profile/layouts/MegaGramLayout'
import { MegaBookLayout } from '@/components/profile/layouts/MegaBookLayout'
import { MegaTokLayout } from '@/components/profile/layouts/MegaTokLayout'
import { MegaTubeLayout } from '@/components/profile/layouts/MegaTubeLayout'


type ProfileWithCounts = Profile & {
    follower_count: number
    following_count: number
    post_count: number
}

type TabType = 'posts' | 'media' | 'likes' | 'saved'

export function ProfilePage() {
    const { username } = useParams<{ username: string }>()
    const currentUser = useProfile()
    const [searchParams] = useSearchParams() // MUST be at top before any returns!
    const [activeTab, setActiveTab] = useState<TabType>('posts')
    // const [isFollowing, setIsFollowing] = useState(false) // Moved to layout components
    const [profile, setProfile] = useState<ProfileWithCounts | null>(null)
    const [posts, setPosts] = useState<FeedPost[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Fetch profile data
    useEffect(() => {
        async function fetchProfile() {
            if (!username) return

            setIsLoading(true)
            try {
                // Fetch profile
                const { data: profileData, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('username', username)
                    .single()

                if (error) throw error

                // Fetch follower count
                const { count: followerCount } = await supabase
                    .from('followers')
                    .select('*', { count: 'exact', head: true })
                    .eq('following_id', profileData.id)

                // Fetch following count
                const { count: followingCount } = await supabase
                    .from('followers')
                    .select('*', { count: 'exact', head: true })
                    .eq('follower_id', profileData.id)

                // Fetch post count
                const { count: postCount } = await supabase
                    .from('posts')
                    .select('*', { count: 'exact', head: true })
                    .eq('author_id', profileData.id)

                setProfile({
                    ...profileData,
                    follower_count: followerCount || 0,
                    following_count: followingCount || 0,
                    post_count: postCount || 0,
                })

                // Fetch user's posts
                const { data: postsData } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('author_id', profileData.id)
                    .order('created_at', { ascending: false })
                    .limit(20)

                if (postsData) {
                    setPosts(postsData.map(post => ({
                        ...post,
                        author: profileData,
                        media: [],
                        user_like: null,
                    })))
                }
            } catch (err) {
                console.error('Error fetching profile:', err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchProfile()
    }, [username])

    // isOwnProfile is declared later after profile loads

    const tabs: { id: TabType; icon: React.ElementType; label: string }[] = [
        { id: 'posts', icon: Grid3X3, label: 'Posts' },
        { id: 'media', icon: Grid3X3, label: 'Media' },
        { id: 'likes', icon: Heart, label: 'Likes' },
        { id: 'saved', icon: Bookmark, label: 'Saved' },
    ]

    // Moved to layout components
    // const formatNumber = (num: number): string => {
    //     if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    //     if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    //     return num.toString()
    // }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">User not found</h2>
                <p className="text-gray-500">The profile you're looking for doesn't exist.</p>
            </div>
        )
    }

    // Determine current layout (searchParams declared at top of component)
    const currentLayout = (searchParams.get('layout') as 'twitter' | 'instagram' | 'linkedin' | 'facebook' | 'tiktok' | 'youtube' | 'cards') || profile?.default_profile_layout || 'cards'


    // Check if viewing own profile
    const isOwnProfile = currentUser?.id === profile?.id

    // Render layout based on selection
    const renderLayout = () => {
        if (!profile) return null

        switch (currentLayout) {
            case 'twitter':
                return <XLayout profile={profile} isOwnProfile={isOwnProfile} />
            case 'instagram':
                return <MegaGramLayout profile={profile} isOwnProfile={isOwnProfile} />
            case 'linkedin':
                return <LinkedInLayout profile={profile} isOwnProfile={isOwnProfile} />
            case 'facebook':
                return <MegaBookLayout profile={profile} isOwnProfile={isOwnProfile} />
            case 'tiktok':
                return <MegaTokLayout profile={profile} isOwnProfile={isOwnProfile} />
            case 'youtube':
                return <MegaTubeLayout profile={profile} isOwnProfile={isOwnProfile} />
            case 'cards':
            default:
                return <CardsLayout profile={profile} isOwnProfile={isOwnProfile} />
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Layout Switcher */}
            {profile && <LayoutSwitcher profile={profile} />}

            {/* Dynamic Layout Rendering */}
            {renderLayout()}

            {/* MegaBucks Stats Card (shown for all layouts except Twitter) */}
            {currentLayout !== 'twitter' && (
                <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 mt-4">
                    <Card padding="md" className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: '#f59e0b' }}
                                >
                                    <Coins size={24} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-yellow-700">Lifetime Earnings</p>
                                    <p className="text-2xl font-bold text-yellow-800">12,450 MB</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-green-600">
                                <TrendingUp size={18} />
                                <span className="font-medium">+15.2% this month</span>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <div className="flex px-4 md:px-6">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                  flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm
                  transition-colors
                  ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }
                `}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 md:p-6">
                {activeTab === 'posts' && (
                    <div className="space-y-4">
                        {posts.length > 0 ? posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onLike={(id) => console.log('Like', id)}
                                onComment={(id) => console.log('Comment', id)}
                                onShare={(id) => console.log('Share', id)}
                            />
                        )) : (
                            <div className="text-center py-12 text-gray-500">
                                <Grid3X3 size={48} className="mx-auto mb-4 text-gray-300" />
                                <p>No posts yet</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'media' && (
                    <div className="grid grid-cols-3 gap-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                            <div key={i} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                                <img
                                    src={`https://picsum.photos/400?random=${i}`}
                                    alt=""
                                    className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
                                />
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'likes' && (
                    <div className="text-center py-12 text-gray-500">
                        <Heart size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>Posts {profile.display_name} liked will appear here</p>
                    </div>
                )}

                {activeTab === 'saved' && (
                    <div className="text-center py-12 text-gray-500">
                        <Bookmark size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>Only you can see your saved posts</p>
                    </div>
                )}
            </div>
        </div>
    )
}
