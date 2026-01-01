import { useState } from 'react'
import { Eye, EyeOff, Lock, Globe, Users } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export interface ProfilePrivacySettings {
    // Layout visibility
    layoutCardsPublic: boolean
    layoutTwitterPublic: boolean
    layoutInstagramPublic: boolean
    layoutLinkedinPublic: boolean
    layoutFacebookPublic: boolean
    layoutTiktokPublic: boolean
    layoutYoutubePublic: boolean

    // Profile sections
    showBadges: boolean
    showCommunityStats: boolean
    showBraggingRights: boolean
    showWalletOverview: boolean
    showVisaTier: boolean
}

interface ProfilePrivacyControlProps {
    settings: ProfilePrivacySettings
    onSave: (settings: ProfilePrivacySettings) => Promise<void>
}

export function ProfilePrivacyControl({ settings: initialSettings, onSave }: ProfilePrivacyControlProps) {
    const [settings, setSettings] = useState(initialSettings)
    const [isSaving, setIsSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const handleToggle = (key: keyof ProfilePrivacySettings) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key],
        }))
        setSaved(false)
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await onSave(settings)
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (error) {
            console.error('Failed to save privacy settings:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const ToggleSwitch = ({
        label,
        description,
        checked,
        onChange
    }: {
        label: string
        description?: string
        checked: boolean
        onChange: () => void
    }) => (
        <div className="flex items-start justify-between py-3">
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    {checked ? (
                        <Globe className="w-4 h-4 text-green-600" />
                    ) : (
                        <Lock className="w-4 h-4 text-gray-400" />
                    )}
                    <label className="font-medium text-gray-900">{label}</label>
                </div>
                {description && (
                    <p className="text-sm text-gray-500 mt-1 ml-6">{description}</p>
                )}
            </div>

            <button
                onClick={onChange}
                className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${checked ? 'bg-green-600' : 'bg-gray-300'}
                `}
            >
                <span
                    className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${checked ? 'translate-x-6' : 'translate-x-1'}
                    `}
                />
            </button>
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Layout Visibility */}
            <Card padding="lg">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Profile Layout Visibility
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                    Control which profile layouts are publicly visible. Private layouts can only be viewed by you.
                </p>

                <div className="divide-y divide-gray-200">
                    <ToggleSwitch
                        label="Cards Layout (Default)"
                        description="Modern card-based profile view"
                        checked={settings.layoutCardsPublic}
                        onChange={() => handleToggle('layoutCardsPublic')}
                    />
                    <ToggleSwitch
                        label="MegaX Layout (Twitter-style)"
                        description="Timeline-based profile"
                        checked={settings.layoutTwitterPublic}
                        onChange={() => handleToggle('layoutTwitterPublic')}
                    />
                    <ToggleSwitch
                        label="MegaGram Layout (Instagram-style)"
                        description="Photo & video grid view"
                        checked={settings.layoutInstagramPublic}
                        onChange={() => handleToggle('layoutInstagramPublic')}
                    />
                    <ToggleSwitch
                        label="MegaLink Layout (LinkedIn-style)"
                        description="Professional profile view"
                        checked={settings.layoutLinkedinPublic}
                        onChange={() => handleToggle('layoutLinkedinPublic')}
                    />
                    <ToggleSwitch
                        label="MegaBook Layout (Facebook-style)"
                        description="Social profile with timeline"
                        checked={settings.layoutFacebookPublic}
                        onChange={() => handleToggle('layoutFacebookPublic')}
                    />
                    <ToggleSwitch
                        label="MegaTok Layout (TikTok-style)"
                        description="Vertical video feed"
                        checked={settings.layoutTiktokPublic}
                        onChange={() => handleToggle('layoutTiktokPublic')}
                    />
                    <ToggleSwitch
                        label="MegaTube Layout (YouTube-style)"
                        description="Video channel view"
                        checked={settings.layoutYoutubePublic}
                        onChange={() => handleToggle('layoutYoutubePublic')}
                    />
                </div>
            </Card>

            {/* Profile Sections */}
            <Card padding="lg">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Profile Sections
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                    Choose what information to display on your public profile.
                </p>

                <div className="divide-y divide-gray-200">
                    <ToggleSwitch
                        label="VISA Tier Badge"
                        description="Show your current VISA tier and level"
                        checked={settings.showVisaTier}
                        onChange={() => handleToggle('showVisaTier')}
                    />
                    <ToggleSwitch
                        label="Achievement Badges"
                        description="Display your earned badges"
                        checked={settings.showBadges}
                        onChange={() => handleToggle('showBadges')}
                    />
                    <ToggleSwitch
                        label="Community Stats"
                        description="Show community members and fabric strength"
                        checked={settings.showCommunityStats}
                        onChange={() => handleToggle('showCommunityStats')}
                    />
                    <ToggleSwitch
                        label="Bragging Rights / Hall of Fame"
                        description="Display your achievements and rankings"
                        checked={settings.showBraggingRights}
                        onChange={() => handleToggle('showBraggingRights')}
                    />
                    <ToggleSwitch
                        label="Wallet Overview"
                        description="Show wallet balances (recommended: private)"
                        checked={settings.showWalletOverview}
                        onChange={() => handleToggle('showWalletOverview')}
                    />
                </div>
            </Card>

            {/* Privacy Tip */}
            <Card padding="md" className="bg-blue-50 border-blue-200">
                <div className="flex gap-3">
                    <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-blue-900 mb-1">Privacy Tip</h4>
                        <p className="text-sm text-blue-800">
                            You can always change these settings later. We recommend keeping wallet information
                            private and sharing only achievement-related content publicly.
                        </p>
                    </div>
                </div>
            </Card>

            {/* Save Button */}
            <div className="flex items-center justify-between">
                <div>
                    {saved && (
                        <span className="text-green-600 text-sm font-medium flex items-center gap-2">
                            <span>✓</span>
                            Settings saved successfully!
                        </span>
                    )}
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6"
                >
                    {isSaving ? 'Saving...' : 'Save Privacy Settings'}
                </Button>
            </div>
        </div>
    )
}

// Compact privacy status indicator for profile header
export function PrivacyBadge({ isPublic }: { isPublic: boolean }) {
    return (
        <div className={`
            inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
            ${isPublic
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }
        `}>
            {isPublic ? (
                <>
                    <Globe className="w-3 h-3" />
                    Public
                </>
            ) : (
                <>
                    <Lock className="w-3 h-3" />
                    Private
                </>
            )}
        </div>
    )
}
