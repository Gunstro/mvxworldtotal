// ============================================================================
// LAYOUT SWITCHER COMPONENT
// ============================================================================
// Allows users to switch between different profile layouts
// ============================================================================

import { useSearchParams } from 'react-router-dom'
import type { Profile } from '@/types/database'

interface LayoutSwitcherProps {
    profile: Profile
}

type LayoutType = 'twitter' | 'instagram' | 'linkedin' | 'facebook' | 'tiktok' | 'youtube' | 'cards'

interface LayoutOption {
    id: LayoutType
    icon: string
    label: string
    enabled: boolean
    isPrivate: boolean
}

export function LayoutSwitcher({ profile }: LayoutSwitcherProps) {
    const [searchParams, setSearchParams] = useSearchParams()
    const currentLayout = (searchParams.get('layout') as LayoutType) || profile.default_profile_layout || 'cards'

    const layouts: LayoutOption[] = [
        {
            id: 'twitter',
            icon: '🐦',
            label: 'MegaX',
            enabled: profile.twitter_layout_enabled ?? true,
            isPrivate: profile.twitter_layout_privacy === 'private'
        },
        {
            id: 'instagram',
            icon: '📸',
            label: 'MegaGram',
            enabled: profile.instagram_layout_enabled ?? true,
            isPrivate: profile.instagram_layout_privacy === 'private'
        },
        {
            id: 'linkedin',
            icon: '💼',
            label: 'MegaLink',
            enabled: profile.linkedin_layout_enabled ?? true,
            isPrivate: profile.linkedin_layout_privacy === 'private'
        },
        {
            id: 'facebook',
            icon: '📰',
            label: 'MegaBook',
            enabled: profile.facebook_layout_enabled ?? true,
            isPrivate: profile.facebook_layout_privacy === 'private'
        },
        {
            id: 'tiktok',
            icon: '🎵',
            label: 'MegaTok',
            enabled: true,
            isPrivate: false
        },
        {
            id: 'youtube',
            icon: '📺',
            label: 'MegaTube',
            enabled: true,
            isPrivate: false
        },
        {
            id: 'cards',
            icon: '🎴',
            label: 'MegaView',
            enabled: profile.cards_layout_enabled ?? true,
            isPrivate: profile.cards_layout_privacy === 'private'
        }
    ]

    const handleLayoutChange = (layoutId: LayoutType) => {
        if (layoutId === 'cards' || layoutId === (profile.default_profile_layout || 'cards')) {
            // Remove layout param for default layout
            searchParams.delete('layout')
        } else {
            searchParams.set('layout', layoutId)
        }
        setSearchParams(searchParams)
    }

    // Filter to show only enabled layouts
    const availableLayouts = layouts.filter(layout => layout.enabled && !layout.isPrivate)

    if (availableLayouts.length <= 1) {
        // Don't show switcher if only one layout is available
        return null
    }

    return (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex gap-0.5 overflow-x-auto scrollbar-hide">
                    {availableLayouts.map((layout) => (
                        <button
                            key={layout.id}
                            onClick={() => handleLayoutChange(layout.id)}
                            className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium whitespace-nowrap transition-all relative ${currentLayout === layout.id
                                ? 'text-gray-900'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <span className="text-base">{layout.icon}</span>
                            <span>{layout.label}</span>
                            {currentLayout === layout.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default LayoutSwitcher
