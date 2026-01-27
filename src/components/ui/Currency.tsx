import { formatCurrencyParts } from '../../lib/utils/formatting';

interface CurrencyProps {
  amount: number;
  showSymbol?: boolean;
}

/**
 * Renders a currency amount with monospace digits and proportional separators.
 * This keeps numbers aligned while reducing visual width of dots and commas.
 */
export function Currency({ amount, showSymbol = true }: CurrencyProps) {
  const parts = formatCurrencyParts(amount);

  return (
    <span>
      {showSymbol && '€'}
      {parts.map((part, i) => (
        part.digits ? (
          <span key={i} style={{ fontFamily: 'Space Mono, monospace' }}>{part.formatted}</span>
        ) : (
          <span key={i} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>{part.formatted}</span>
        )
      ))}
    </span>
  );
}
