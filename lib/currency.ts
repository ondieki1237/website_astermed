/**
 * Format price to Kenyan Shilling (KSH)
 */
export const formatPrice = (price: number): string => {
  return `KSH ${price.toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Format price without currency symbol
 */
export const formatPriceValue = (price: number): string => {
  return price.toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Get currency symbol
 */
export const CURRENCY = 'KSH'
