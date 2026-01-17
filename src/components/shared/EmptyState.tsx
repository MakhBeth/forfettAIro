import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  message: string;
}

export function EmptyState({ icon, message }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon}
      <p>{message}</p>
    </div>
  );
}
