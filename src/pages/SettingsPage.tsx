// ============================================================================
// SETTINGS PAGE
// ============================================================================
// Comprehensive user settings with tabs
// ============================================================================

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    User,
    Shield,
    Bell,
    Lock,
    UserX,
    ChevronLeft,
    Settings as SettingsIcon
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ImageUploader } from '@/components/profile/ImageUploader'
import { ProfileEditor } from '@/components/profile/ProfileEditor'
import { useProfile } from '@/stores/authStore'

type TabType = 'profile' | 'privacy' | 'notifications' | 'account' | 'blocked'

export function SettingsPage() {
    const navigate = useNavigate()
    const profile = useProfile()
    const [activeTab, setActiveTab] = useState<TabType>('profile')

    const tabs = [
        { id: 'profile' as TabType, label: 'Profile', icon: User },
        { id: 'privacy' as TabType, label: 'Privacy', icon: Shield },
        { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
        { id: 'account' as TabType, label: 'Account', icon: Lock },
        { id: 'blocked' as TabType, label: 'Blocked Users', icon: UserX },
    ]

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <SettingsIcon size={28} />
                        Settings
                    </h1>
                    <p className="text-gray-500">Manage your account preferences</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar Tabs - Desktop */}
                <div className="hidden md:block">
                    <Card padding="sm">
                        <nav className="space-y-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === tab.id
                                                ? 'bg-blue-50 text-blue-600 font-medium'
                                                : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Icon size={20} />
                                        {tab.label}
                                    </button>
                                )
                            })}
                        </nav>
                    </Card>
                </div>

                {/* Mobile Tabs */}
                <div className="md:hidden mb-4">
                    <Card padding="none">
                        <div className="flex overflow-x-auto">
                            {tabs.map((tab) => {
                                const Icon = tab.icon
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 border-b-2 transition-colors ${activeTab === tab.id
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500'
                                            }`}
                                    >
                                        <Icon size={20} />
                                        <span className="text-xs">{tab.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </Card>
                </div>

                {/* Content Area */}
                <div className="md:col-span-3">
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            {/* Cover Photo */}
                            <Card padding="none">
                                <ImageUploader
                                    type="cover"
                                    currentImageUrl={profile?.cover_url}
                                />
                            </Card>

                            {/* Profile Picture */}
                            <Card padding="lg">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
                                <div className="flex items-center gap-6">
                                    <ImageUploader
                                        type="avatar"
                                        currentImageUrl={profile?.avatar_url}
                                    />
                                    <div>
                                        <p className="text-sm text-gray-700 mb-1">Click the camera icon to upload a new profile picture</p>
                                        <p className="text-xs text-gray-500">Recommended: Square image, at least 400x400px</p>
                                    </div>
                                </div>
                            </Card>

                            {/* Profile Editor */}
                            <ProfileEditor inline />
                        </div>
                    )}

                    {activeTab === 'privacy' && (
                        <Card padding="lg">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Privacy Settings</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-3">Profile Visibility</h3>
                                    <div className="space-y-3">
                                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">Private Profile</p>
                                                <p className="text-sm text-gray-500">Only approved followers can see your posts</p>
                                            </div>
                                            <input type="checkbox" className="w-5 h-5 text-blue-600 border-gray-300 rounded" />
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-3">Who Can See</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <span className="text-gray-700">Your Email</span>
                                            <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
                                                <option>Only Me</option>
                                                <option>Friends</option>
                                                <option>Everyone</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <span className="text-gray-700">Your Location</span>
                                            <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
                                                <option>Only Me</option>
                                                <option>Friends</option>
                                                <option>Everyone</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-3">Who Can</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <span className="text-gray-700">Send you messages</span>
                                            <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
                                                <option>Everyone</option>
                                                <option>Friends</option>
                                                <option>Nobody</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <span className="text-gray-700">Tag you in posts</span>
                                            <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
                                                <option>Everyone</option>
                                                <option>Friends</option>
                                                <option>Nobody</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'notifications' && (
                        <Card padding="lg">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-3">Push Notifications</h3>
                                    <div className="space-y-3">
                                        {['New follower', 'Someone liked your post', 'New comment', 'New message', 'Mentions'].map((item) => (
                                            <label key={item} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                <span className="text-gray-700">{item}</span>
                                                <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 border-gray-300 rounded" />
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-3">Email Notifications</h3>
                                    <div className="space-y-3">
                                        {['Weekly digest', 'New followers', 'Direct messages', 'Comments on your posts'].map((item) => (
                                            <label key={item} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                <span className="text-gray-700">{item}</span>
                                                <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 border-gray-300 rounded" />
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'account' && (
                        <Card padding="lg">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Account Settings</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-3">Email Address</h3>
                                    <p className="text-sm text-gray-600 mb-2">{profile?.email || 'Not set'}</p>
                                    <button className="text-blue-600 hover:underline text-sm">Change email</button>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-3">Password</h3>
                                    <button className="text-blue-600 hover:underline text-sm">Change password</button>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-3">Two-Factor Authentication</h3>
                                    <p className="text-sm text-gray-600 mb-2">Add an extra layer of security</p>
                                    <button className="text-blue-600 hover:underline text-sm">Enable 2FA</button>
                                </div>

                                <div className="pt-6 border-t border-gray-200">
                                    <h3 className="font-semibold text-red-600 mb-3">Danger Zone</h3>
                                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'blocked' && (
                        <Card padding="lg">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Blocked Users</h2>
                            <div className="text-center py-12 text-gray-500">
                                <UserX size={48} className="mx-auto mb-4 text-gray-300" />
                                <p>You haven't blocked anyone yet</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SettingsPage
