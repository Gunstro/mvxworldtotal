import { useState, useEffect, useRef } from 'react'
import {
    Heart,
    MessageCircle,
    Share2,
    Music,
    MoreHorizontal,
    Play,
    Pause,
    Volume2,
    VolumeX,
    ChevronUp,
    ChevronDown,
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import type { Profile } from '@/types/database'

interface Video {
    id: string
    url: string
    thumbnail: string
    caption: string
    music?: {
        title: string
        artist: string
    }
    likes: number
    comments: number
    shares: number
    views: number
    isLiked: boolean
}

interface MegaTokLayoutProps {
    profile: Profile
    isOwnProfile: boolean
}

export function MegaTokLayout({ profile, isOwnProfile }: MegaTokLayoutProps) {
    // Mock videos - replace with real data
    const [videos] = useState<Video[]>([
        {
            id: '1',
            url: 'https://player.vimeo.com/video/76979871',
            thumbnail: 'https://picsum.photos/1080/1920',
            caption: 'Building my community one member at a time! 🚀 #MegaVXWorld #CommunityFirst',
            music: {
                title: 'Summer Vibes',
                artist: 'DJ Cool',
            },
            likes: 12450,
            comments: 234,
            shares: 89,
            views: 45670,
            isLiked: false,
        },
        {
            id: '2',
            url: 'https://player.vimeo.com/video/76979871',
            thumbnail: 'https://picsum.photos/1080/1920?random=2',
            caption: 'Just hit £10K in earnings! 💰 Here\'s how you can too 👇',
            music: {
                title: 'Victory Dance',
                artist: 'Winners Club',
            },
            likes: 23890,
            comments: 567,
            shares: 234,
            views: 123450,
            isLiked: true,
        },
    ])

    const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    const currentVideo = videos[currentVideoIndex]

    useEffect(() => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.play()
            } else {
                videoRef.current.pause()
            }
        }
    }, [isPlaying, currentVideoIndex])

    const handleVideoClick = () => {
        setIsPlaying(!isPlaying)
    }

    const handleNext = () => {
        if (currentVideoIndex < videos.length - 1) {
            setCurrentVideoIndex(currentVideoIndex + 1)
            setIsPlaying(true)
        }
    }

    const handlePrevious = () => {
        if (currentVideoIndex > 0) {
            setCurrentVideoIndex(currentVideoIndex - 1)
            setIsPlaying(true)
        }
    }

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
        return num.toString()
    }

    return (
        <div className="fixed inset-0 bg-black">
            {/* Video Container */}
            <div className="relative h-full w-full max-w-[600px] mx-auto">
                {/* Navigation Buttons */}
                <button
                    onClick={handlePrevious}
                    disabled={currentVideoIndex === 0}
                    className="absolute left-1/2 top-20 -translate-x-1/2 z-20 bg-white bg-opacity-20 hover:bg-opacity-30 disabled:opacity-0 rounded-full p-2 transition-opacity"
                >
                    <ChevronUp className="w-6 h-6 text-white" />
                </button>

                <button
                    onClick={handleNext}
                    disabled={currentVideoIndex === videos.length - 1}
                    className="absolute left-1/2 bottom-32 -translate-x-1/2 z-20 bg-white bg-opacity-20 hover:bg-opacity-30 disabled:opacity-0 rounded-full p-2 transition-opacity"
                >
                    <ChevronDown className="w-6 h-6 text-white" />
                </button>

                {/* Video Player */}
                <div
                    className="relative h-full w-full cursor-pointer"
                    onClick={handleVideoClick}
                >
                    {/* Thumbnail while not playing */}
                    {!isPlaying && (
                        <img
                            src={currentVideo.thumbnail}
                            alt="Video thumbnail"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    )}

                    {/* Video Element */}
                    <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        src={currentVideo.url}
                        loop
                        playsInline
                        muted={isMuted}
                    />

                    {/* Play/Pause Overlay */}
                    {!isPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                            <div className="bg-white bg-opacity-30 backdrop-blur-sm rounded-full p-6">
                                <Play className="w-16 h-16 text-white fill-white" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side Actions */}
                <div className="absolute right-4 bottom-32 flex flex-col gap-6 z-10">
                    {/* Profile Avatar */}
                    <div className="relative">
                        <Avatar
                            src={profile.avatar_url || ''}
                            alt={profile.display_name || profile.username}
                            size="lg"
                            className="border-2 border-white"
                        />
                        {!isOwnProfile && (
                            <button className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-500 rounded-full p-1">
                                <span className="text-white text-xl leading-none">+</span>
                            </button>
                        )}
                    </div>

                    {/* Like Button */}
                    <button className="flex flex-col items-center gap-1">
                        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3 hover:bg-opacity-30 transition-colors">
                            <Heart
                                className={`w-7 h-7 ${currentVideo.isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`}
                            />
                        </div>
                        <span className="text-white text-xs font-semibold drop-shadow">
                            {formatNumber(currentVideo.likes)}
                        </span>
                    </button>

                    {/* Comment Button */}
                    <button className="flex flex-col items-center gap-1">
                        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3 hover:bg-opacity-30 transition-colors">
                            <MessageCircle className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-white text-xs font-semibold drop-shadow">
                            {formatNumber(currentVideo.comments)}
                        </span>
                    </button>

                    {/* Share Button */}
                    <button className="flex flex-col items-center gap-1">
                        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3 hover:bg-opacity-30 transition-colors">
                            <Share2 className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-white text-xs font-semibold drop-shadow">
                            {formatNumber(currentVideo.shares)}
                        </span>
                    </button>

                    {/* More Options */}
                    <button className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3 hover:bg-opacity-30 transition-colors">
                        <MoreHorizontal className="w-7 h-7 text-white" />
                    </button>
                </div>

                {/* Bottom Info */}
                <div className="absolute left-4 right-20 bottom-24 z-10">
                    {/* Username */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-white font-semibold drop-shadow-lg">
                            @{profile.username}
                        </span>
                        {profile.is_verified && (
                            <span className="text-blue-400">✓</span>
                        )}
                    </div>

                    {/* Caption */}
                    <p className="text-white text-sm mb-4 drop-shadow-lg line-clamp-2">
                        {currentVideo.caption}
                    </p>

                    {/* Music Info */}
                    {currentVideo.music && (
                        <div className="flex items-center gap-2 text-white">
                            <Music className="w-4 h-4" />
                            <span className="text-sm truncate drop-shadow">
                                {currentVideo.music.title} • {currentVideo.music.artist}
                            </span>
                        </div>
                    )}
                </div>

                {/* Top Bar */}
                <div className="absolute top-0 left-0 right-0 p-4 z-10 flex items-center justify-between">
                    <div className="text-white font-semibold drop-shadow-lg">
                        {isOwnProfile ? 'My Videos' : `${profile.display_name}'s Videos`}
                    </div>

                    {/* Mute Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsMuted(!isMuted)
                        }}
                        className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-2 hover:bg-opacity-30 transition-colors"
                    >
                        {isMuted ? (
                            <VolumeX className="w-5 h-5 text-white" />
                        ) : (
                            <Volume2 className="w-5 h-5 text-white" />
                        )}
                    </button>
                </div>

                {/* Progress Indicator */}
                <div className="absolute top-16 left-0 right-0 px-4 z-10">
                    <div className="flex gap-1">
                        {videos.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-0.5 flex-1 rounded-full transition-colors ${idx === currentVideoIndex
                                        ? 'bg-white'
                                        : 'bg-white bg-opacity-30'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* View Count */}
                <div className="absolute top-20 left-4 z-10">
                    <div className="bg-black bg-opacity-50 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-white text-xs font-semibold">
                            {formatNumber(currentVideo.views)} views
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
