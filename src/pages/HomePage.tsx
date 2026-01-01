import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Users, Coins, ChevronRight, Loader2 } from 'lucide-react'
import { CreatePost } from '@/components/posts/CreatePost'
import { PostCard } from '@/components/posts/PostCard'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { supabase } from '@/lib/supabase'
import { useProfile, useWallet } from '@/stores/authStore'
import type { FeedPost, Profile } from '@/types/database'

const trendingTags = ['#MegaVX', '#PassiveIncome', '#CryptoLife', '#BuildingWealth', '#Community']

export function HomePage() {
    const [posts, setPosts] = useState<FeedPost[]>([])
    const [suggestedUsers, setSuggestedUsers] = useState<Profile[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const profile = useProfile()
    const wallet = useWallet()

    // Fetch posts and suggested users
    useEffect(() => {
        async function fetchFeed() {
            setIsLoading(true)
            try {
                // Fetch recent public posts with author info
                const { data: postsData, error } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('visibility', 'public')
                    .eq('is_deleted', false)
                    .order('created_at', { ascending: false })
                    .limit(20)

                if (error) throw error

                // Fetch authors for posts
                if (postsData && postsData.length > 0) {
                    const authorIds = [...new Set(postsData.map(p => p.author_id))]
                    const { data: authorsData } = await supabase
                        .from('profiles')
                        .select('*')
                        .in('id', authorIds)

                    const authorsMap = new Map(authorsData?.map(a => [a.id, a]) || [])

                    setPosts(postsData.map(post => ({
                        ...post,
                        author: authorsMap.get(post.author_id) || null,
                        media: [],
                        user_like: null,
                    })))
                } else {
                    setPosts([])
                }

                // Fetch suggested users (random 5 users)
                const { data: usersData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('is_active', true)
                    .neq('id', profile?.id || '')
                    .limit(5)

                if (usersData) {
                    setSuggestedUsers(usersData.map(u => ({
                        ...u,
                        follower_count: 0,
                        following_count: 0,
                        post_count: 0,
                    })))
                }
            } catch (err) {
                console.error('Error fetching feed:', err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchFeed()
    }, [profile?.id])

    const handlePostCreated = () => {
        // Refetch posts
        window.location.reload()
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex gap-6">
                {/* Main Feed */}
                <div className="flex-1 max-w-2xl">
                    {/* Create Post */}
                    <CreatePost onPostCreated={handlePostCreated} />

                    {/* Feed */}
                    <div>
                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                            </div>
                        ) : posts.length > 0 ? (
                            posts.map((post) => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    onLike={(id) => console.log('Like', id)}
                                    onComment={(id) => console.log('Comment', id)}
                                    onShare={(id) => console.log('Share', id)}
                                />
                            ))
                        ) : (
                            <Card padding="lg" className="text-center">
                                <p className="text-gray-500 mb-4">No posts yet. Be the first to post!</p>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Right Sidebar */}
                <aside className="hidden xl:block w-80 flex-shrink-0 space-y-4">
                    {/* Trending Topics */}
                    <Card padding="md">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="text-primary-500" size={20} />
                            <h3 className="font-semibold text-surface-900">Trending</h3>
                        </div>
                        <div className="space-y-3">
                            {trendingTags.map((tag) => (
                                <Link
                                    key={tag}
                                    to={`/hashtag/${tag.slice(1)}`}
                                    className="block hover:bg-surface-50 -mx-2 px-2 py-1 rounded-lg transition-colors"
                                >
                                    <p className="font-medium text-surface-900">{tag}</p>
                                    <p className="text-sm text-surface-500">
                                        {Math.floor(Math.random() * 10 + 1) * 100} posts
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </Card>

                    {/* Suggested Users */}
                    <Card padding="md">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Users className="text-primary-500" size={20} />
                                <h3 className="font-semibold text-surface-900">Who to Follow</h3>
                            </div>
                            <Link
                                to="/explore/people"
                                className="text-sm text-primary-600 hover:underline"
                            >
                                See all
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {suggestedUsers.map((user) => (
                                <div key={user.id} className="flex items-center gap-3">
                                    <Link to={`/profile/${user.username}`}>
                                        <Avatar src={user.avatar_url} size="md" />
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            to={`/profile/${user.username}`}
                                            className="font-semibold text-surface-900 hover:underline truncate block"
                                        >
                                            {user.display_name}
                                        </Link>
                                        <p className="text-sm text-surface-500 truncate">
                                            @{user.username}
                                        </p>
                                    </div>
                                    <button className="px-3 py-1.5 text-sm font-semibold text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
                                        Follow
                                    </button>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Your Earnings Today */}
                    <Card padding="md" className="bg-gradient-to-br from-megabucks-50 to-megabucks-100 border-megabucks-200">
                        <div className="flex items-center gap-2 mb-3">
                            <Coins className="text-megabucks-600" size={20} />
                            <h3 className="font-semibold text-megabucks-800">Today's Earnings</h3>
                        </div>
                        <div className="text-3xl font-bold text-megabucks-700 mb-1">
                            +42.5 MB
                        </div>
                        <p className="text-sm text-megabucks-600 mb-4">
                            Keep engaging to earn more!
                        </p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-megabucks-600">Posts</span>
                                <span className="font-medium text-megabucks-700">+20 MB</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-megabucks-600">Comments</span>
                                <span className="font-medium text-megabucks-700">+15 MB</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-megabucks-600">Engagement</span>
                                <span className="font-medium text-megabucks-700">+7.5 MB</span>
                            </div>
                        </div>
                        <Link
                            to="/wallet"
                            className="flex items-center justify-center gap-2 mt-4 py-2 w-full
                       bg-megabucks-500 text-white rounded-lg font-medium
                       hover:bg-megabucks-600 transition-colors"
                        >
                            View Wallet <ChevronRight size={16} />
                        </Link>
                    </Card>

                    {/* Advertising Spot */}
                    <Card padding="none" className="relative overflow-hidden">
                        <div
                            className="w-full h-48 flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                                border: '1px dashed #444444'
                            }}
                        >
                            <div className="text-center">
                                <div className="text-3xl mb-2">📢</div>
                                <p className="text-sm font-medium" style={{ color: '#888888' }}>
                                    Your Ad Here
                                </p>
                                <p className="text-xs mt-1" style={{ color: '#666666' }}>
                                    300x250
                                </p>
                            </div>
                        </div>
                        <div className="p-3 text-center" style={{ borderTop: '1px solid #2a2a2a' }}>
                            <Link
                                to="/advertise"
                                className="text-xs font-medium hover:underline"
                                style={{ color: '#d4af37' }}
                            >
                                Advertise with MegaVX →
                            </Link>
                        </div>
                    </Card>

                    {/* Footer links */}
                    <div className="text-xs text-surface-500 px-2">
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2">
                            <Link to="/about" className="hover:underline">
                                About
                            </Link>
                            <Link to="/terms" className="hover:underline">
                                Terms
                            </Link>
                            <Link to="/privacy" className="hover:underline">
                                Privacy
                            </Link>
                            <Link to="/help" className="hover:underline">
                                Help
                            </Link>
                        </div>
                        <p>© 2025 MegaVX. All rights reserved.</p>
                    </div>
                </aside>
            </div>
        </div>
    )
}
