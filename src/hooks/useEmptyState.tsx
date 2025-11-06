import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/ui/empty-state';
import { emptyStates, EmptyStateKey } from '@/config/empty-states';

export function useEmptyState() {
  const navigate = useNavigate();

  const renderEmptyState = (key: EmptyStateKey, customAction?: { label: string; onClick: () => void }) => {
    const config = emptyStates[key];
    
    // Use custom action if provided, otherwise use config action with navigation
    const action = customAction || (config.action ? {
      label: config.action.label,
      onClick: () => navigate(config.action!.path),
    } : undefined);

    return (
      <EmptyState
        icon={config.icon}
        title={config.title}
        description={config.description}
        action={action}
      />
    );
  };

  return { renderEmptyState };
}
