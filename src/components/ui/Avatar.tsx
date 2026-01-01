import { User } from 'lucide-react'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

interface AvatarProps {
    src?: string | null
    alt?: string
    size?: AvatarSize
    className?: string
    isOnline?: boolean
    hasStory?: boolean
    storyViewed?: boolean
    onClick?: () => void
}

const sizeClasses: Record<AvatarSize, string> = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
    '2xl': 'w-32 h-32',
}

const iconSizes: Record<AvatarSize, number> = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 28,
    xl: 40,
    '2xl': 64,
}

const onlineDotSizes: Record<AvatarSize, string> = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5',
}

export function Avatar({
    src,
    alt = 'User avatar',
    size = 'md',
    className = '',
    isOnline,
    hasStory,
    storyViewed,
    onClick,
}: AvatarProps) {
    const avatarContent = (
        <div
            className={`
        relative rounded-full overflow-hidden bg-surface-200
        flex items-center justify-center
        ${sizeClasses[size]}
        ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}
        ${className}
      `}
            onClick={onClick}
        >
            {src ? (
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            ) : (
                <User
                    size={iconSizes[size]}
                    className="text-surface-400"
                />
            )}

            {/* Online indicator */}
            {isOnline && (
                <span
                    className={`
            absolute bottom-0 right-0 
            ${onlineDotSizes[size]}
            bg-success-500 rounded-full 
            border-2 border-white
          `}
                />
            )}
        </div>
    )

    // Story ring wrapper
    if (hasStory) {
        return (
            <div
                className={`
          p-0.5 rounded-full
          ${storyViewed
                        ? 'bg-surface-300'
                        : 'bg-gradient-to-tr from-secondary-500 via-primary-500 to-pink-500'
                    }
        `}
            >
                {avatarContent}
            </div>
        )
    }

    return avatarContent
}

// Avatar Group for displaying multiple avatars
interface AvatarGroupProps {
    avatars: { src?: string; alt?: string }[]
    max?: number
    size?: AvatarSize
}

export function AvatarGroup({ avatars, max = 4, size = 'sm' }: AvatarGroupProps) {
    const displayAvatars = avatars.slice(0, max)
    const remainingCount = avatars.length - max

    return (
        <div className="flex -space-x-2">
            {displayAvatars.map((avatar, index) => (
                <Avatar
                    key={index}
                    src={avatar.src}
                    alt={avatar.alt}
                    size={size}
                    className="ring-2 ring-white"
                />
            ))}
            {remainingCount > 0 && (
                <div
                    className={`
            ${sizeClasses[size]}
            flex items-center justify-center
            bg-surface-200 rounded-full
            ring-2 ring-white
            text-xs font-medium text-surface-600
          `}
                >
                    +{remainingCount}
                </div>
            )}
        </div>
    )
}
