import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import {
    Heart,
    MessageCircle,
    Share2,
    Bookmark,
    MoreHorizontal,
    Globe,
    Users,
    Lock,
    BadgeCheck,
    Coins,
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import type { FeedPost } from '@/types/database'

interface PostCardProps {
    post: FeedPost
    onLike?: (postId: string) => void
    onComment?: (postId: string) => void
    onShare?: (postId: string) => void
    onSave?: (postId: string) => void
}

const visibilityIcons = {
    public: Globe,
    friends: Users,
    private: Lock,
    custom: Users,
}

export function PostCard({ post, onLike, onComment, onShare, onSave }: PostCardProps) {
    const [isLiked, setIsLiked] = useState(!!post.user_like)
    const [likeCount, setLikeCount] = useState(post.like_count)
    const [showActions, setShowActions] = useState(false)

    const VisibilityIcon = visibilityIcons[post.visibility]

    const handleLike = () => {
        setIsLiked(!isLiked)
        setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1))
        onLike?.(post.id)
    }

    const formatContent = (content: string) => {
        // Convert hashtags to links
        return content.split(/(\s+)/).map((word, index) => {
            if (word.startsWith('#')) {
                return (
                    <Link
                        key={index}
                        to={`/hashtag/${word.slice(1)}`}
                        className="text-primary-600 hover:underline"
                    >
                        {word}
                    </Link>
                )
            }
            if (word.startsWith('@')) {
                return (
                    <Link
                        key={index}
                        to={`/profile/${word.slice(1)}`}
                        className="text-primary-600 hover:underline font-medium"
                    >
                        {word}
                    </Link>
                )
            }
            return word
        })
    }

    return (
        <Card className="mb-4 overflow-hidden">
            {/* Header */}
            <div className="p-4 pb-0">
                <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                        <Link to={`/profile/${post.author.username}`}>
                            <Avatar
                                src={post.author.avatar_url}
                                size="md"
                                hasStory
                                storyViewed={false}
                            />
                        </Link>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <Link
                                    to={`/profile/${post.author.username}`}
                                    className="font-semibold text-surface-900 hover:underline"
                                >
                                    {post.author.display_name || post.author.username}
                                </Link>
                                {post.author.is_verified && (
                                    <BadgeCheck size={16} className="text-primary-500" />
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-surface-500">
                                <span>
                                    {formatDistanceToNow(new Date(post.created_at), {
                                        addSuffix: true,
                                    })}
                                </span>
                                <span>·</span>
                                <VisibilityIcon size={14} />
                            </div>
                        </div>
                    </div>

                    {/* More actions */}
                    <button
                        className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
                        onClick={() => setShowActions(!showActions)}
                    >
                        <MoreHorizontal size={20} className="text-surface-500" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 py-3">
                {post.feeling && (
                    <p className="text-sm text-surface-500 mb-2">
                        feeling <span className="font-medium">{post.feeling}</span>
                    </p>
                )}
                {post.content && (
                    <p className="text-surface-900 whitespace-pre-wrap">
                        {formatContent(post.content)}
                    </p>
                )}
                {post.location && (
                    <p className="mt-2 text-sm text-surface-500">
                        📍 {post.location}
                    </p>
                )}
            </div>

            {/* Media */}
            {post.has_media && post.media && post.media.length > 0 && (
                <div className="relative">
                    {post.media.length === 1 ? (
                        <img
                            src={post.media[0].file_url}
                            alt=""
                            className="w-full max-h-[500px] object-cover"
                            loading="lazy"
                        />
                    ) : (
                        <div
                            className={`grid gap-1 ${post.media.length === 2
                                ? 'grid-cols-2'
                                : post.media.length === 3
                                    ? 'grid-cols-2 grid-rows-2'
                                    : 'grid-cols-2 grid-rows-2'
                                }`}
                        >
                            {post.media.slice(0, 4).map((media, index) => (
                                <div
                                    key={media.id}
                                    className={`relative ${post.media!.length === 3 && index === 0
                                        ? 'row-span-2'
                                        : ''
                                        }`}
                                >
                                    <img
                                        src={media.file_url}
                                        alt=""
                                        className="w-full h-full object-cover aspect-square"
                                        loading="lazy"
                                    />
                                    {index === 3 && post.media!.length > 4 && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <span className="text-white text-2xl font-bold">
                                                +{post.media!.length - 4}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Stats */}
            <div className="px-4 py-3">
                <div className="flex items-center justify-between text-sm text-surface-500">
                    <div className="flex items-center gap-1">
                        {likeCount > 0 && (
                            <>
                                <div className="flex -space-x-1">
                                    <span className="w-5 h-5 rounded-full bg-danger-500 flex items-center justify-center text-white">
                                        <Heart size={10} fill="currentColor" />
                                    </span>
                                </div>
                                <span>{likeCount.toLocaleString()}</span>
                            </>
                        )}
                    </div>
                    <div className="flex gap-4">
                        {post.comment_count > 0 && (
                            <span>{post.comment_count} comments</span>
                        )}
                        {post.share_count > 0 && <span>{post.share_count} shares</span>}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="px-4 py-2 border-t border-surface-200">
                <div className="flex items-center justify-between">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
              ${isLiked
                                ? 'text-danger-500 bg-danger-50'
                                : 'text-surface-600 hover:bg-surface-100'
                            }`}
                    >
                        <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                        <span className="font-medium">Like</span>
                    </button>

                    <button
                        onClick={() => onComment?.(post.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-surface-600 hover:bg-surface-100 transition-colors"
                    >
                        <MessageCircle size={20} />
                        <span className="font-medium">Comment</span>
                    </button>

                    <button
                        onClick={() => onShare?.(post.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-surface-600 hover:bg-surface-100 transition-colors"
                    >
                        <Share2 size={20} />
                        <span className="font-medium">Share</span>
                    </button>

                    <button
                        onClick={() => onSave?.(post.id)}
                        className="p-2 rounded-lg text-surface-600 hover:bg-surface-100 transition-colors"
                    >
                        <Bookmark size={20} />
                    </button>
                </div>
            </div>

            {/* Earning indicator */}
            {isLiked && (
                <div className="px-4 py-2 bg-megabucks-50 border-t border-megabucks-100 animate-fade-in">
                    <div className="flex items-center gap-2 text-sm text-megabucks-700">
                        <Coins size={16} />
                        <span>+1 MB earned for engagement!</span>
                    </div>
                </div>
            )}
        </Card>
    )
}
