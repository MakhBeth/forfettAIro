// Generate stable color for client based on ID
export const getClientColor = (clientId: string): string => {
  const colors = [
    '#10b981', '#059669', '#047857', '#22c55e', '#16a34a',
    '#14b8a6', '#0d9488', '#0891b2', '#06b6d4', '#0ea5e9',
    '#84cc16', '#65a30d', '#f59e0b', '#f97316', '#ef4444'
  ];
  // Simple hash function to generate consistent index
  let hash = 0;
  for (let i = 0; i < clientId.length; i++) {
    hash = clientId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};
