import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    helperText?: string
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
        const inputId = id || `input-${Math.random().toString(36).substring(7)}`

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium mb-1.5"
                        style={{ color: '#cccccc' }}
                    >
                        {label}
                    </label>
                )}

                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#888888' }}>
                            {leftIcon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        className={`
              w-full px-4 py-3 rounded-xl 
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-0
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${className}
            `}
                        style={{
                            backgroundColor: '#1a1a1a',
                            border: error ? '1px solid #ef4444' : '1px solid #333333',
                            color: '#f5f5f5',
                        }}
                        {...props}
                    />

                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#888888' }}>
                            {rightIcon}
                        </div>
                    )}
                </div>

                {error && (
                    <p className="mt-1.5 text-sm" style={{ color: '#ef4444' }}>{error}</p>
                )}

                {helperText && !error && (
                    <p className="mt-1.5 text-sm" style={{ color: '#888888' }}>{helperText}</p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'
