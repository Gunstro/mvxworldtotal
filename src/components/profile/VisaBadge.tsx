import { Crown, Shield, Star, Sparkles } from 'lucide-react'

export interface VisaTier {
    key: string
    name: string
    level: number
    color: string
    gradient: string
    icon: string // Emoji for MVP
    advantages: string[]
    monthlyFee: number
    monthlyCap: number
}

export const VISA_TIERS: Record<string, VisaTier> = {
    free: {
        key: 'free',
        name: 'Free',
        level: 1,
        color: '#6B7280',
        gradient: 'from-gray-600 to-gray-800',
        icon: '/assets/visa-badges/free512.png.png',
        advantages: [
            '£95/month earning cap',
            'Basic community access',
            'Standard support',
            'Access to marketplace',
        ],
        monthlyFee: 0,
        monthlyCap: 95,
    },
    novice: {
        key: 'novice',
        name: 'Novice',
        level: 2,
        color: '#78716C',
        gradient: 'from-stone-500 to-stone-700',
        icon: '/assets/visa-badges/novice512.png.png',
        advantages: [
            '£295/month earning cap',
            'Community builder tools',
            'Priority support',
            'Advanced analytics',
        ],
        monthlyFee: 95,
        monthlyCap: 295,
    },
    city_dweller: {
        key: 'city_dweller',
        name: 'City Dweller',
        level: 3,
        color: '#CD7F32',
        gradient: 'from-amber-700 to-orange-900',
        icon: '/assets/visa-badges/city-dweller512.png.png',
        advantages: [
            '£395/month earning cap',
            'Video hosting',
            'Custom profile themes',
            'Advertising agent access',
        ],
        monthlyFee: 195,
        monthlyCap: 395,
    },
    city_patron: {
        key: 'city_patron',
        name: 'City Patron',
        level: 4,
        color: '#C0C0C0',
        gradient: 'from-gray-300 to-gray-500',
        icon: '/assets/visa-badges/city-patron512.png.png',
        advantages: [
            '£495/month earning cap',
            'Premium badge frame',
            'NFT shack registration',
            'Loan eligibility',
        ],
        monthlyFee: 295,
        monthlyCap: 495,
    },
    executive: {
        key: 'executive',
        name: 'Executive',
        level: 5,
        color: '#1C1C1C',
        gradient: 'from-gray-800 to-black',
        icon: '/assets/visa-badges/executive 512.png.png',
        advantages: [
            '£695/month earning cap',
            'Executive lounge access',
            'Enhanced commission rates',
            'White-label options',
        ],
        monthlyFee: 395,
        monthlyCap: 695,
    },
    ambassador: {
        key: 'ambassador',
        name: 'Ambassador',
        level: 6,
        color: '#D4AF37',
        gradient: 'from-yellow-600 to-yellow-800',
        icon: '/assets/visa-badges/ambassador 512.png.png',
        advantages: [
            '£985/month earning cap',
            'Ambassador title',
            'Global events access',
            'Revenue sharing program',
        ],
        monthlyFee: 495,
        monthlyCap: 985,
    },
    premiere: {
        key: 'premiere',
        name: 'Premiere',
        level: 7,
        color: '#FFD700',
        gradient: 'from-yellow-400 to-yellow-600',
        icon: '/assets/visa-badges/premiere 512.png.png',
        advantages: [
            '£1,250/month earning cap',
            'Premiere verification badge',
            'Priority placement',
            'Custom branding',
        ],
        monthlyFee: 795,
        monthlyCap: 1250,
    },
    gold_premiere: {
        key: 'gold_premiere',
        name: 'Gold Premiere',
        level: 8,
        color: '#FFD700',
        gradient: 'from-yellow-500 to-amber-700',
        icon: '/assets/visa-badges/gold-premiere 512.png.png',
        advantages: [
            '£2,250/month earning cap',
            'Gold verification badge',
            'VIP support',
            'Exclusive partner program',
        ],
        monthlyFee: 895,
        monthlyCap: 2250,
    },
    vip_founder: {
        key: 'vip_founder',
        name: 'VIP Founder',
        level: 9,
        color: '#1C1C1C',
        gradient: 'from-black via-yellow-600 to-black',
        icon: '/assets/visa-badges/vip-founder 512.png.png',
        advantages: [
            '£3,750/month earning cap',
            'VIP Founder crown badge',
            'Lifetime benefits',
            'Board member access',
        ],
        monthlyFee: 1950,
        monthlyCap: 3750,
    },
    gold_vip_founder: {
        key: 'gold_vip_founder',
        name: 'Gold VIP Founder',
        level: 10,
        color: '#FFD700',
        gradient: 'from-yellow-400 via-yellow-600 to-black',
        icon: '/assets/visa-badges/gold-vip-founder 512.png.png',
        advantages: [
            'UNLIMITED earning potential',
            'Diamond VIP badge',
            'Founding member hall of fame',
            'Revenue sharing equity',
            'Personal account manager',
        ],
        monthlyFee: 2750,
        monthlyCap: 999999, // Effectively unlimited
    },
}

export interface VisaBadgeProps {
    tier: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    showName?: boolean
    showAdvantages?: boolean
    className?: string
}

export function VisaBadge({
    tier,
    size = 'md',
    showName = true,
    showAdvantages = false,
    className = ''
}: VisaBadgeProps) {
    const visaTier = VISA_TIERS[tier] || VISA_TIERS.free

    const sizeClasses = {
        sm: 'w-12 h-12 text-2xl',
        md: 'w-16 h-16 text-3xl', lg: 'w-24 h-24 text-5xl',
        xl: 'w-32 h-32 text-6xl',
    }

    const textSizes = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-lg',
        xl: 'text-2xl',
    }

    return (
        <div className={`flex flex-col items-center gap-2 ${className}`}>
            {/* Badge Circle */}
            <div
                className={`
                    ${sizeClasses[size]}
                    rounded-full
                    bg-gradient-to-br ${visaTier.gradient}
                    flex items-center justify-center
                    shadow-lg
                    ring-4 ring-white
                    transform transition-transform hover:scale-110
                    relative
                `}
            >
                <img
                    src={visaTier.icon}
                    alt={`${visaTier.name} VISA Badge`}
                    className="w-full h-full object-contain p-1"
                />

                {/* Sparkle effect for high tiers */}
                {visaTier.level >= 8 && (
                    <div className="absolute -top-1 -right-1">
                        <Sparkles className="w-4 h-4 text-white animate-pulse" />
                    </div>
                )}
            </div>

            {/* Tier Name */}
            {showName && (
                <div className="text-center">
                    <p
                        className={`font-bold ${textSizes[size]}`}
                        style={{ color: visaTier.color }}
                    >
                        {visaTier.name}
                    </p>
                    <p className="text-xs text-gray-500">
                        Level {visaTier.level} VISA
                    </p>
                </div>
            )}

            {/* Advantages List */}
            {showAdvantages && (
                <div className="mt-4 w-full max-w-md space-y-2">
                    <h4 className="font-semibold text-gray-900 mb-3">Your Advantages:</h4>
                    {visaTier.advantages.map((advantage, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span className="text-sm text-gray-700">{advantage}</span>
                        </div>
                    ))}

                    {/* Pricing Info */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Monthly Fee:</span>
                            <span className="font-semibold">
                                {visaTier.monthlyFee === 0 ? 'FREE' : `£${visaTier.monthlyFee}`}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                            <span className="text-gray-600">Monthly Cap:</span>
                            <span className="font-semibold text-green-600">
                                {visaTier.monthlyCap >= 999999 ? 'UNLIMITED' : `£${visaTier.monthlyCap}`}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// Quick tier comparison
export function VisaTierComparison({ currentTier }: { currentTier: string }) {
    const current = VISA_TIERS[currentTier]
    const allTiers = Object.values(VISA_TIERS).sort((a, b) => a.level - b.level)

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold">VISA Tier Progression</h3>

            <div className="relative">
                {/* Progress bar */}
                <div className="absolute top-6 left-0 right-0 h-2 bg-gray-200 rounded-full" />
                <div
                    className="absolute top-6 left-0 h-2 bg-gradient-to-r from-gray-400 to-red-500 rounded-full transition-all"
                    style={{ width: `${(current.level / 10) * 100}%` }}
                />

                {/* Tier markers */}
                <div className="relative flex justify-between">
                    {allTiers.map((tier) => (
                        <div
                            key={tier.key}
                            className={`flex flex-col items-center ${tier.level <= current.level ? 'opacity-100' : 'opacity-40'
                                }`}
                        >
                            <div
                                className={`
                                    w-12 h-12 rounded-full flex items-center justify-center text-2xl
                                    bg-gradient-to-br ${tier.gradient}
                                    ${tier.level === current.level ? 'ring-4 ring-yellow-400 scale-125' : ''}
                                    transition-all shadow-lg
                                `}
                            >
                                <img
                                    src={tier.icon}
                                    alt={tier.name}
                                    className="w-full h-full object-contain p-0.5"
                                />
                            </div>
                            <span className="text-xs mt-2 text-center max-w-[60px]">
                                {tier.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Next tier info */}
            {current.level < 10 && (
                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-900">
                        <strong>Next Tier:</strong> {allTiers[current.level].name}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                        Unlock higher earning caps and exclusive benefits!
                    </p>
                </div>
            )}
        </div>
    )
}
