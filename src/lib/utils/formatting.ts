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
  }).format(amount);
};
