import { ExternalLink, CreditCard, Calculator, Eye, SquareStack } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useCreditsModal } from '@/components/ai/CreditsModalContext';
import { buildMarketplaceUrl, buildLeadGenUrl } from '@/lib/publicLinks';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/Tooltip';

type TenantInfo = {
  id: string;
  slug: string | null;
};

type QuickActionsProps = {
  variant?: 'full' | 'compact';
  className?: string;
};

export default function QuickActions({ variant = 'full', className = '' }: QuickActionsProps) {
  const creditsModal = useCreditsModal();
  const [, setLocation] = useLocation();
  
  const { data: tenant } = useQuery<TenantInfo>({
    queryKey: ['/api/me/tenant'],
    queryFn: async () => {
      const res = await fetch('/api/me/tenant', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch tenant');
      return res.json();
    },
  });

  const hasSlug = Boolean(tenant?.slug);
  const marketplaceUrl = hasSlug ? buildMarketplaceUrl(tenant?.slug) : '';
  const leadGenUrl = hasSlug ? buildLeadGenUrl(tenant?.slug) : '';

  const handleTopUp = () => {
    creditsModal.open({ reason: 'Top up credits' });
  };

  const handlePreviewListing = () => {
    if (marketplaceUrl) {
      window.open(marketplaceUrl, '_blank');
    }
  };

  const handlePreviewCalculator = () => {
    if (leadGenUrl) {
      window.open(leadGenUrl, '_blank');
    }
  };

  const handleBakerCalculator = () => {
    setLocation('/baker/calculator');
  };

  const previewListingTooltip = hasSlug
    ? "Preview Listing"
    : "Set up your public profile in Settings first";

  const previewCalculatorTooltip = hasSlug
    ? "Preview Calculator"
    : "Set up your public profile in Settings first";

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Tooltip label="Baker Calculator">
          <button
            onClick={handleBakerCalculator}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <SquareStack className="h-4 w-4" />
          </button>
        </Tooltip>
        <Tooltip label="Top-Up Credits">
          <button
            onClick={handleTopUp}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <CreditCard className="h-4 w-4" />
          </button>
        </Tooltip>
        <Tooltip label={previewListingTooltip}>
          <button
            onClick={handlePreviewListing}
            disabled={!hasSlug}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Eye className="h-4 w-4" />
          </button>
        </Tooltip>
        <Tooltip label={previewCalculatorTooltip}>
          <button
            onClick={handlePreviewCalculator}
            disabled={!hasSlug}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Calculator className="h-4 w-4" />
          </button>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${className}`}>
      <Button
        variant="outline"
        onClick={handleBakerCalculator}
        className="w-full justify-start gap-2"
      >
        <SquareStack className="h-4 w-4" />
        Baker Calculator
      </Button>
      <Button
        variant="outline"
        onClick={handleTopUp}
        className="w-full justify-start gap-2"
      >
        <CreditCard className="h-4 w-4" />
        Top-Up Credits
      </Button>
      <Tooltip label={previewListingTooltip}>
        <Button
          variant="outline"
          onClick={handlePreviewListing}
          disabled={!hasSlug}
          className="w-full justify-start gap-2"
        >
          <Eye className="h-4 w-4" />
          <span className="truncate">Preview Listing</span>
          <ExternalLink className="h-3 w-3 ml-auto opacity-60" />
        </Button>
      </Tooltip>
      <Tooltip label={previewCalculatorTooltip}>
        <Button
          variant="outline"
          onClick={handlePreviewCalculator}
          disabled={!hasSlug}
          className="w-full justify-start gap-2"
        >
          <Calculator className="h-4 w-4" />
          <span className="truncate">Preview Calculator</span>
          <ExternalLink className="h-3 w-3 ml-auto opacity-60" />
        </Button>
      </Tooltip>
    </div>
  );
}
