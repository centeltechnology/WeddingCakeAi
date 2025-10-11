import { ExternalLink, CreditCard, Calculator, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
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
  
  const { data: tenant } = useQuery<TenantInfo>({
    queryKey: ['/api/me/tenant'],
    queryFn: async () => {
      const res = await fetch('/api/me/tenant', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch tenant');
      return res.json();
    },
  });

  const marketplaceUrl = buildMarketplaceUrl(tenant?.slug);
  const leadGenUrl = buildLeadGenUrl(tenant?.slug);

  const handleTopUp = () => {
    creditsModal.open({ reason: 'Top up credits' });
  };

  const handlePreviewListing = () => {
    window.open(marketplaceUrl, '_blank');
  };

  const handlePreviewCalculator = () => {
    window.open(leadGenUrl, '_blank');
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Tooltip label="Top-Up Credits">
          <button
            onClick={handleTopUp}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <CreditCard className="h-4 w-4" />
          </button>
        </Tooltip>
        <Tooltip label="Preview Listing">
          <button
            onClick={handlePreviewListing}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Eye className="h-4 w-4" />
          </button>
        </Tooltip>
        <Tooltip label="Preview Calculator">
          <button
            onClick={handlePreviewCalculator}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Calculator className="h-4 w-4" />
          </button>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${className}`}>
      <Button
        variant="outline"
        onClick={handleTopUp}
        className="w-full justify-start gap-2"
      >
        <CreditCard className="h-4 w-4" />
        Top-Up Credits
      </Button>
      <Button
        variant="outline"
        onClick={handlePreviewListing}
        className="w-full justify-start gap-2"
      >
        <Eye className="h-4 w-4" />
        <span className="truncate">Preview Listing</span>
        <ExternalLink className="h-3 w-3 ml-auto opacity-60" />
      </Button>
      <Button
        variant="outline"
        onClick={handlePreviewCalculator}
        className="w-full justify-start gap-2"
      >
        <Calculator className="h-4 w-4" />
        <span className="truncate">Preview Calculator</span>
        <ExternalLink className="h-3 w-3 ml-auto opacity-60" />
      </Button>
    </div>
  );
}
