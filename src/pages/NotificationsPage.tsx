import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    Heart,
    MessageCircle,
    UserPlus,
    Repeat2,
    AtSign,
    Coins,
    Bell,
    Settings,
    CheckCheck,
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

type NotificationType = 'like' | 'comment' | 'follow' | 'share' | 'mention' | 'megabucks'

interface Notification {
    id: string
    type: NotificationType
    message: string
    user: {
        username: string
        display_name: string
        avatar_url: string
    }
    post_id?: string
    amount?: number
    timestamp: string
    is_read: boolean
}

const mockNotifications: Notification[] = [
    {
        id: '1',
        type: 'megabucks',
        message: 'You earned 25 MB from your viral post!',
        user: { username: 'megavx', display_name: 'MegaVX', avatar_url: '' },
        amount: 25,
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        is_read: false,
    },
    {
        id: '2',
        type: 'like',
        message: 'liked your post',
        user: { username: 'emma_w', display_name: 'Emma Wilson', avatar_url: 'https://i.pravatar.cc/150?img=5' },
        post_id: '123',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        is_read: false,
    },
    {
        id: '3',
        type: 'follow',
        message: 'started following you',
        user: { username: 'david_c', display_name: 'David Chen', avatar_url: 'https://i.pravatar.cc/150?img=12' },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        is_read: false,
    },
    {
        id: '4',
        type: 'comment',
        message: 'commented: "This is amazing! 🔥"',
        user: { username: 'sarah_j', display_name: 'Sarah Johnson', avatar_url: 'https://i.pravatar.cc/150?img=1' },
        post_id: '124',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        is_read: true,
    },
    {
        id: '5',
        type: 'mention',
        message: 'mentioned you in a post',
        user: { username: 'mike_t', display_name: 'Michael Torres', avatar_url: 'https://i.pravatar.cc/150?img=8' },
        post_id: '125',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        is_read: true,
    },
    {
        id: '6',
        type: 'share',
        message: 'shared your post',
        user: { username: 'alex_p', display_name: 'Alex Parker', avatar_url: 'https://i.pravatar.cc/150?img=15' },
        post_id: '126',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        is_read: true,
    },
]

const notificationIcons: Record<NotificationType, { icon: React.ElementType; color: string; bg: string }> = {
    like: { icon: Heart, color: '#ef4444', bg: '#fef2f2' },
    comment: { icon: MessageCircle, color: '#3b82f6', bg: '#eff6ff' },
    follow: { icon: UserPlus, color: '#8b5cf6', bg: '#f5f3ff' },
    share: { icon: Repeat2, color: '#10b981', bg: '#ecfdf5' },
    mention: { icon: AtSign, color: '#f59e0b', bg: '#fffbeb' },
    megabucks: { icon: Coins, color: '#f59e0b', bg: '#fffbeb' },
}

export function NotificationsPage() {
    const [notifications, setNotifications] = useState(mockNotifications)
    const [filter, setFilter] = useState<'all' | 'unread'>('all')

    const filteredNotifications = filter === 'unread'
        ? notifications.filter((n) => !n.is_read)
        : notifications

    const unreadCount = notifications.filter((n) => !n.is_read).length

    const markAllAsRead = () => {
        setNotifications(notifications.map((n) => ({ ...n, is_read: true })))
    }

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / (1000 * 60))
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const days = Math.floor(hours / 24)

        if (minutes < 60) return `${minutes}m`
        if (hours < 24) return `${hours}h`
        if (days < 7) return `${days}d`
        return date.toLocaleDateString()
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    {unreadCount > 0 && (
                        <p className="text-gray-500">{unreadCount} unread notifications</p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            leftIcon={<CheckCheck size={16} />}
                        >
                            Mark all read
                        </Button>
                    )}
                    <Link to="/settings/notifications">
                        <Button variant="ghost" size="sm">
                            <Settings size={18} />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${filter === 'all'
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('unread')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${filter === 'unread'
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                >
                    Unread {unreadCount > 0 && `(${unreadCount})`}
                </button>
            </div>

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
                <Card padding="lg" className="text-center">
                    <Bell size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">
                        {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                    </p>
                </Card>
            ) : (
                <Card padding="none">
                    <div className="divide-y divide-gray-100">
                        {filteredNotifications.map((notification) => {
                            const { icon: Icon, color, bg } = notificationIcons[notification.type]

                            return (
                                <div
                                    key={notification.id}
                                    className={`flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors ${!notification.is_read ? 'bg-blue-50/50' : ''
                                        }`}
                                >
                                    {/* Avatar with icon overlay */}
                                    <div className="relative">
                                        {notification.type === 'megabucks' ? (
                                            <div
                                                className="w-12 h-12 rounded-full flex items-center justify-center"
                                                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                                            >
                                                <Coins size={24} className="text-white" />
                                            </div>
                                        ) : (
                                            <>
                                                <Avatar src={notification.user.avatar_url} size="md" />
                                                <div
                                                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white"
                                                    style={{ backgroundColor: bg }}
                                                >
                                                    <Icon size={12} style={{ color }} />
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-gray-900">
                                            {notification.type !== 'megabucks' && (
                                                <Link
                                                    to={`/profile/${notification.user.username}`}
                                                    className="font-semibold hover:underline"
                                                >
                                                    {notification.user.display_name}
                                                </Link>
                                            )}{' '}
                                            {notification.message}
                                            {notification.amount && (
                                                <span className="font-semibold text-yellow-600">
                                                    {' '}+{notification.amount} MB
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-0.5">
                                            {formatTime(notification.timestamp)}
                                        </p>
                                    </div>

                                    {/* Unread indicator */}
                                    {!notification.is_read && (
                                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </Card>
            )}
        </div>
    )
}
