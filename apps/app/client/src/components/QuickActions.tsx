import { ExternalLink, CreditCard, Calculator, Eye, SquareStack, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useCreditsModal } from '@/components/ai/CreditsModalContext';
import { buildPublicCalculatorUrl, buildBookingUrl, buildListingUrl } from '@/lib/publicLinks';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/Tooltip';

type QuickActionsProps = {
  variant?: 'full' | 'compact';
  className?: string;
};

export default function QuickActions({ variant = 'full', className = '' }: QuickActionsProps) {
  const creditsModal = useCreditsModal();
  const [, setLocation] = useLocation();
  const [slug, setSlug] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const t = await (await fetch('/api/me/tenant')).json();
        setSlug(t?.slug ?? null);
      } catch {}
      try {
        const p = await (await fetch('/api/me/profile')).json();
        setIsPublished(!!p?.isPublished);
      } catch {}
    })();
  }, []);

  const calcHref = buildPublicCalculatorUrl(slug);
  const bookingHref = buildBookingUrl(slug);
  const listingHref = buildListingUrl(slug);
  
  const publicReady = Boolean(slug && isPublished);

  const handleTopUp = () => {
    creditsModal.open({ reason: 'Top up credits' });
  };

  const handleBakerCalculator = () => {
    setLocation('/baker/calculator');
  };

  const calcTooltip = publicReady
    ? 'Open calculator'
    : 'Publish your profile in Settings to enable';

  const bookingTooltip = publicReady
    ? 'Open booking'
    : 'Publish your profile in Settings to enable';

  const listingTooltip = publicReady
    ? 'Open listing'
    : 'Publish your profile in Settings to enable';

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
        <Tooltip label={listingTooltip}>
          {publicReady ? (
            <a
              data-testid="nav-listing"
              href={listingHref}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Eye className="h-4 w-4" />
            </a>
          ) : (
            <span className="p-2 rounded-lg opacity-50 cursor-not-allowed">
              <Eye className="h-4 w-4" />
            </span>
          )}
        </Tooltip>
        <Tooltip label={calcTooltip}>
          {publicReady ? (
            <a
              data-testid="nav-calc"
              href={calcHref}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Calculator className="h-4 w-4" />
            </a>
          ) : (
            <span className="p-2 rounded-lg opacity-50 cursor-not-allowed">
              <Calculator className="h-4 w-4" />
            </span>
          )}
        </Tooltip>
        <Tooltip label={bookingTooltip}>
          {publicReady ? (
            <a
              data-testid="nav-book"
              href={bookingHref}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Calendar className="h-4 w-4" />
            </a>
          ) : (
            <span className="p-2 rounded-lg opacity-50 cursor-not-allowed">
              <Calendar className="h-4 w-4" />
            </span>
          )}
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
      <Tooltip label={listingTooltip}>
        <Button
          variant="outline"
          asChild
          disabled={!publicReady}
          className="w-full justify-start gap-2"
        >
          <a
            href={publicReady ? listingHref : undefined}
            onClick={(e) => { if (!publicReady) e.preventDefault(); }}
          >
            <Eye className="h-4 w-4" />
            <span className="truncate">Preview Listing</span>
            <ExternalLink className="h-3 w-3 ml-auto opacity-60" />
          </a>
        </Button>
      </Tooltip>
      <Tooltip label={calcTooltip}>
        <Button
          variant="outline"
          asChild
          disabled={!publicReady}
          className="w-full justify-start gap-2"
        >
          <a
            href={publicReady ? calcHref : undefined}
            onClick={(e) => { if (!publicReady) e.preventDefault(); }}
          >
            <Calculator className="h-4 w-4" />
            <span className="truncate">Preview Calculator</span>
            <ExternalLink className="h-3 w-3 ml-auto opacity-60" />
          </a>
        </Button>
      </Tooltip>
    </div>
  );
}
