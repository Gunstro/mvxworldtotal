import { useState } from 'react'
import { Image, Video, Smile, MapPin, Calendar, Users } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useProfile } from '@/stores/authStore'
import { useToast } from '@/stores/uiStore'

interface CreatePostProps {
    onPostCreated?: () => void
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
    const [content, setContent] = useState('')
    const [isExpanded, setIsExpanded] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const profile = useProfile()
    const toast = useToast()

    const handleSubmit = async () => {
        if (!content.trim()) return

        setIsLoading(true)
        try {
            // For now, just simulate post creation
            // In production, this would call Supabase
            await new Promise((resolve) => setTimeout(resolve, 1000))

            toast.success('Post created!', '+10 MegaBucks earned 🎉')
            setContent('')
            setIsExpanded(false)
            onPostCreated?.()
        } catch (error) {
            toast.error('Failed to create post', 'Please try again')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="mb-4">
            <div className="p-4">
                <div className="flex gap-3">
                    <Avatar src={profile?.avatar_url} size="md" />
                    <div className="flex-1">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onFocus={() => setIsExpanded(true)}
                            placeholder={`What's on your mind, ${profile?.display_name || profile?.username}?`}
                            className="w-full resize-none border-0 bg-transparent text-surface-900 
                       placeholder-surface-400 focus:outline-none focus:ring-0"
                            rows={isExpanded ? 4 : 2}
                        />
                    </div>
                </div>

                {/* Expanded options */}
                {isExpanded && (
                    <div className="mt-4 animate-fade-in">
                        {/* Action buttons */}
                        <div className="flex items-center gap-1 pb-4 border-b border-surface-200">
                            <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-surface-600 hover:bg-surface-100 transition-colors">
                                <Image size={20} className="text-success-500" />
                                <span className="text-sm">Photo</span>
                            </button>
                            <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-surface-600 hover:bg-surface-100 transition-colors">
                                <Video size={20} className="text-danger-500" />
                                <span className="text-sm">Video</span>
                            </button>
                            <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-surface-600 hover:bg-surface-100 transition-colors">
                                <Smile size={20} className="text-warning-500" />
                                <span className="text-sm">Feeling</span>
                            </button>
                            <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-surface-600 hover:bg-surface-100 transition-colors">
                                <MapPin size={20} className="text-primary-500" />
                                <span className="text-sm">Location</span>
                            </button>
                            <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-surface-600 hover:bg-surface-100 transition-colors">
                                <Calendar size={20} className="text-secondary-500" />
                                <span className="text-sm">Event</span>
                            </button>
                        </div>

                        {/* Submit section */}
                        <div className="flex items-center justify-between pt-4">
                            <div className="flex items-center gap-2 text-sm text-surface-500">
                                <Users size={16} />
                                <span>Public</span>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                        setIsExpanded(false)
                                        setContent('')
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSubmit}
                                    disabled={!content.trim()}
                                    isLoading={isLoading}
                                >
                                    Post
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Collapsed action bar */}
                {!isExpanded && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-surface-200">
                        <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-surface-600 hover:bg-surface-100 transition-colors">
                            <Image size={20} className="text-success-500" />
                            <span className="text-sm font-medium">Photo</span>
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-surface-600 hover:bg-surface-100 transition-colors">
                            <Video size={20} className="text-danger-500" />
                            <span className="text-sm font-medium">Video</span>
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-surface-600 hover:bg-surface-100 transition-colors">
                            <Smile size={20} className="text-warning-500" />
                            <span className="text-sm font-medium">Feeling</span>
                        </button>
                    </div>
                )}
            </div>
        </Card>
    )
}
