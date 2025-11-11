import { useMemo, useEffect } from 'react';
import { CakeCalculator } from '@/components/CakeCalculator';

export default function PublicCalculatorV1Redirect() {
  // Read tenant slug from URL query parameter
  const tenantSlug = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tenant');
  }, []);

  // Debug logging to ensure component is rendering
  useEffect(() => {
    console.log('PublicCalculatorV1Redirect rendering with tenant:', tenantSlug);
  }, [tenantSlug]);

  // Public calculator is available to everyone (authenticated or not)
  // If tenant slug is provided, use it; otherwise fall back to demo baker
  if (tenantSlug) {
    console.log('Rendering CakeCalculator with tenantSlug:', tenantSlug);
    return <CakeCalculator tenantSlug={tenantSlug} />;
  }

  console.log('Rendering CakeCalculator with default bakerId');
  return <CakeCalculator bakerId="567d2421-7a5a-454f-8cc8-66b2f5f803f8" />;
}
