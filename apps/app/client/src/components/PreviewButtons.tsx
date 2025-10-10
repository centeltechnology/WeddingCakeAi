import { buildMarketplaceUrl, buildLeadGenUrl } from '@/lib/publicLinks';
import { useTenant } from '@/hooks/useTenant';
import { Button } from '@/components/ui/Button';

interface PreviewButtonsProps {
  size?: 'sm' | 'md';
  className?: string;
}

export default function PreviewButtons({ size = 'sm', className = '' }: PreviewButtonsProps) {
  const { data } = useTenant();
  const slug = data?.slug ?? null;
  const marketUrl = buildMarketplaceUrl(slug);
  const leadUrl = buildLeadGenUrl(slug, { preferBooking: true });

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {import.meta.env.VITE_PUBLIC_MARKETPLACE_ENABLED === 'true' && (
        <a href={marketUrl} target="_blank" rel="noreferrer">
          <Button variant="outline-light" size={size}>
            Preview Listing
          </Button>
        </a>
      )}
      {import.meta.env.VITE_PUBLIC_CALCULATOR_ENABLED === 'true' && (
        <a href={leadUrl} target="_blank" rel="noreferrer">
          <Button variant="outline-light" size={size}>
            Preview Calculator
          </Button>
        </a>
      )}
    </div>
  );
}
