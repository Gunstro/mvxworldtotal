// ============================================================================
// REFERRAL LINK CARD
// ============================================================================
// Beautiful card showing user's referral link with copy functionality
// Users share this link to invite others into their team
// ============================================================================

import { useState } from 'react'
import { Copy, Check, Users, Share2, Link as LinkIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useProfile } from '@/stores/authStore'

interface ReferralLinkCardProps {
    className?: string
}

export function ReferralLinkCard({ className = '' }: ReferralLinkCardProps) {
    const profile = useProfile()
    const [copied, setCopied] = useState(false)

    // Generate referral link using username
    const referralLink = profile?.username
        ? `${window.location.origin}/auth?ref=${profile.username}`
        : ''

    const handleCopy = async () => {
        if (!referralLink) return

        try {
            await navigator.clipboard.writeText(referralLink)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            console.error('Failed to copy:', error)
        }
    }

    const handleShare = async () => {
        if (!referralLink) return

        // Use Web Share API if available (mobile)
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join MegaVX World!',
                    text: `Join me on MegaVX and start earning! Use my referral link:`,
                    url: referralLink,
                })
            } catch (error) {
                console.error('Share failed:', error)
            }
        } else {
            // Fallback to copy
            handleCopy()
        }
    }

    if (!profile) return null

    return (
        <Card
            className={`p-6 ${className}`}
            style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
            }}
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                        background: 'linear-gradient(135deg, #d4af37 0%, #c9a227 100%)',
                    }}
                >
                    <Users className="w-6 h-6" style={{ color: '#0a0a0a' }} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Invite Your Team</h3>
                    <p className="text-sm text-gray-400">Share your referral link and grow your network</p>
                </div>
            </div>

            {/* Referral Link Display */}
            <div
                className="p-4 rounded-lg mb-4"
                style={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                }}
            >
                <div className="flex items-center gap-2 mb-2">
                    <LinkIcon className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-medium text-gray-400">YOUR REFERRAL LINK</span>
                </div>
                <div className="flex items-center gap-2">
                    <code
                        className="flex-1 text-sm font-mono text-white overflow-x-auto whitespace-nowrap"
                        style={{
                            scrollbarWidth: 'thin',
                        }}
                    >
                        {referralLink}
                    </code>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                <Button
                    onClick={handleCopy}
                    className="flex-1 flex items-center justify-center gap-2"
                    style={{
                        background: copied
                            ? 'linear-gradient(to right, #22c55e, #16a34a)'
                            : 'linear-gradient(to right, #d4af37, #c9a227)',
                        color: '#0a0a0a',
                    }}
                >
                    {copied ? (
                        <>
                            <Check className="w-4 h-4" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <Copy className="w-4 h-4" />
                            Copy Link
                        </>
                    )}
                </Button>

                {navigator.share && (
                    <Button
                        onClick={handleShare}
                        className="flex items-center justify-center gap-2 px-4"
                        style={{
                            backgroundColor: '#2a2a2a',
                            color: '#fff',
                        }}
                    >
                        <Share2 className="w-4 h-4" />
                        Share
                    </Button>
                )}
            </div>

            {/* Info Text */}
            <div
                className="mt-4 p-3 rounded-lg text-xs"
                style={{
                    backgroundColor: 'rgba(212, 175, 55, 0.05)',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                }}
            >
                <p className="text-gray-400">
                    💡 <span className="font-medium text-amber-400">How it works:</span> When someone signs up using your link, they'll be placed in your team and you'll earn commissions from their activities.
                </p>
            </div>
        </Card>
    )
}

export default ReferralLinkCard
