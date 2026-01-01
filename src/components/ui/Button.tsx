import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'megabucks'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant
    size?: ButtonSize
    isLoading?: boolean
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: `text-black font-semibold
            shadow-lg shadow-yellow-500/25
            hover:shadow-xl hover:shadow-yellow-500/30`,
    secondary: `bg-transparent border border-gray-600 text-gray-300
              hover:bg-gray-800 hover:border-gray-500`,
    ghost: `bg-transparent text-gray-400 hover:bg-gray-800 hover:text-white`,
    danger: `bg-gradient-to-r from-red-600 to-red-700 text-white 
           shadow-lg shadow-red-500/25
           hover:from-red-700 hover:to-red-800`,
    megabucks: `text-black font-semibold
              shadow-lg shadow-yellow-500/25
              hover:shadow-xl hover:shadow-yellow-500/30`,
}

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            isLoading = false,
            leftIcon,
            rightIcon,
            disabled,
            className = '',
            children,
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={`
          inline-flex items-center justify-center gap-2
          font-semibold rounded-xl
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
                style={
                    variant === 'primary' || variant === 'megabucks'
                        ? { background: 'linear-gradient(to right, #d4af37, #c9a227)' }
                        : undefined
                }
                {...props}
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : leftIcon ? (
                    leftIcon
                ) : null}
                {children}
                {rightIcon && !isLoading && rightIcon}
            </button>
        )
    }
)

Button.displayName = 'Button'
