/**
 * Format a currency amount with Italian locale.
 * Shows decimals only if the amount has cents.
 * @param amount - The amount to format
 * @returns Formatted string (e.g., "1.234" or "1.234,50")
 */
export const formatCurrency = (amount: number): string => {
  const hasDecimals = amount % 1 !== 0;
  return new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
    useGrouping: true,
  }).format(amount);
};

/**
 * Render a currency amount with monospace digits and proportional separators.
 * This reduces visual width while keeping digits aligned.
 * @param amount - The amount to format
 * @returns Object with parts for custom rendering
 */
export const formatCurrencyParts = (amount: number): { digits: string; formatted: string }[] => {
  const hasDecimals = amount % 1 !== 0;
  const parts = new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
    useGrouping: true,
  }).formatToParts(amount);

  return parts.map(part => ({
    digits: part.type === 'integer' || part.type === 'fraction' ? part.value : '',
    formatted: part.value,
  }));
};
