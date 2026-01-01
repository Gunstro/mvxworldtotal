/**
 * Currency formatting utilities for MegaVX World
 * All currency displays should use GBP (£) format
 */

/**
 * Format a number as GBP currency
 * @param amount - The amount to format
 * @param showDecimals - Whether to show decimal places (default: false for whole numbers)
 */
export function formatGBP(amount: number | string, showDecimals = false): string {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount

    if (isNaN(value)) return '£0'

    if (showDecimals) {
        return `£${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    return `£${value.toLocaleString('en-GB')}`
}

/**
 * Format a number as GBP with "k" or "M" suffix for large numbers
 * @param amount - The amount to format
 */
export function formatGBPCompact(amount: number | string): string {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount

    if (isNaN(value)) return '£0'

    if (value >= 1000000) {
        return `£${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
        return `£${(value / 1000).toFixed(1)}k`
    }

    return `£${value.toLocaleString('en-GB')}`
}

/**
 * Currency symbol constant
 */
export const CURRENCY_SYMBOL = '£'
export const CURRENCY_CODE = 'GBP'
