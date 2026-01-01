/**
 * Currency formatting utilities for MegaVX World
 * All currency displays use AF (Afro) - linked 1:1 with GBP
 */

/**
 * Format a number as Afro currency
 * @param amount - The amount to format
 * @param showDecimals - Whether to show decimal places (default: false for whole numbers)
 */
export function formatAF(amount: number | string, showDecimals = false): string {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount

    if (isNaN(value)) return 'AF 0'

    if (showDecimals) {
        return `AF ${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    return `AF ${value.toLocaleString('en-GB')}`
}

/**
 * Format a number as Afro with "k" or "M" suffix for large numbers
 * @param amount - The amount to format
 */
export function formatAFCompact(amount: number | string): string {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount

    if (isNaN(value)) return 'AF 0'

    if (value >= 1000000) {
        return `AF ${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
        return `AF ${(value / 1000).toFixed(1)}k`
    }

    return `AF ${value.toLocaleString('en-GB')}`
}

/**
 * Currency symbol/prefix constant
 */
export const CURRENCY_SYMBOL = 'AF'
export const CURRENCY_CODE = 'AFR'
export const CURRENCY_NAME = 'Afro'

/**
 * Legacy aliases for backward compatibility
 * @deprecated Use formatAF instead
 */
export const formatGBP = formatAF
export const formatGBPCompact = formatAFCompact
