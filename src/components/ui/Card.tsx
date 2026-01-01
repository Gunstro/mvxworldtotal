import React from 'react'

interface CardProps {
    children: React.ReactNode
    className?: string
    padding?: 'none' | 'sm' | 'md' | 'lg'
    hover?: boolean
    onClick?: () => void
    style?: React.CSSProperties
}

const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
}

export function Card({
    children,
    className = '',
    padding = 'md',
    hover = false,
    onClick,
    style,
}: CardProps) {
    return (
        <div
            className={`
        rounded-2xl shadow-sm
        ${hover ? 'transition-all duration-200' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${paddingClasses[padding]}
        ${className}
      `}
            onClick={onClick}
            style={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #2a2a2a',
                ...style,
            }}
        >
            {children}
        </div>
    )
}

// Card Header
interface CardHeaderProps {
    children: React.ReactNode
    className?: string
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
    return (
        <div className={`flex items-center justify-between mb-4 ${className}`}>
            {children}
        </div>
    )
}

// Card Title
interface CardTitleProps {
    children: React.ReactNode
    className?: string
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
    return (
        <h3 className={`text-lg font-semibold text-surface-900 ${className}`}>
            {children}
        </h3>
    )
}

// Card Content
interface CardContentProps {
    children: React.ReactNode
    className?: string
}

export function CardContent({ children, className = '' }: CardContentProps) {
    return <div className={className}>{children}</div>
}

// Card Footer
interface CardFooterProps {
    children: React.ReactNode
    className?: string
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
    return (
        <div className={`mt-4 pt-4 border-t border-surface-200 ${className}`}>
            {children}
        </div>
    )
}
