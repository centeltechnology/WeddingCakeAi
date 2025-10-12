import { useMemo } from 'react';
import { CakeCalculator } from '@/components/CakeCalculator';

export default function PublicCalculatorV1Redirect() {
  // Read tenant slug from URL query parameter
  const tenantSlug = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tenant');
  }, []);

  // Public calculator is available to everyone (authenticated or not)
  // If tenant slug is provided, use it; otherwise fall back to demo baker
  if (tenantSlug) {
    return <CakeCalculator tenantSlug={tenantSlug} />;
  }

  return <CakeCalculator bakerId="567d2421-7a5a-454f-8cc8-66b2f5f803f8" />;
}
