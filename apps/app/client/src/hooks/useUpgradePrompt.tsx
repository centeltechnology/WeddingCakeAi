import { useState } from 'react';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { parseSubscriptionError, type SubscriptionError } from '@/lib/subscriptionUtils';

interface UseUpgradePromptResult {
  showUpgradePrompt: (error: any, feature?: string, title?: string) => void;
  isUpgradePromptOpen: boolean;
  closeUpgradePrompt: () => void;
  UpgradePromptComponent: () => JSX.Element | null;
}

export function useUpgradePrompt(): UseUpgradePromptResult {
  const [isOpen, setIsOpen] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<SubscriptionError | null>(null);
  const [feature, setFeature] = useState<string>('');
  const [title, setTitle] = useState<string>('Upgrade Required');

  const showUpgradePrompt = (error: any, featureName?: string, promptTitle?: string) => {
    const parsedError = parseSubscriptionError(error);
    if (parsedError) {
      setSubscriptionError(parsedError);
      setFeature(featureName || '');
      setTitle(promptTitle || 'Upgrade Required');
      setIsOpen(true);
    }
  };

  const closeUpgradePrompt = () => {
    setIsOpen(false);
    setSubscriptionError(null);
    setFeature('');
    setTitle('Upgrade Required');
  };

  const UpgradePromptComponent = () => {
    if (!subscriptionError) return null;

    return (
      <UpgradePrompt
        isOpen={isOpen}
        onClose={closeUpgradePrompt}
        title={title}
        message={subscriptionError.message}
        currentPlan={subscriptionError.currentPlan}
        requiredPlan={subscriptionError.requiredPlan}
        feature={feature}
      />
    );
  };

  return {
    showUpgradePrompt,
    isUpgradePromptOpen: isOpen,
    closeUpgradePrompt,
    UpgradePromptComponent
  };
}