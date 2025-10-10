import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useMe } from '@/lib/useMe';
import CakeCalculator from '@/components/CakeCalculator';

export default function PublicCalculatorV1Redirect() {
  const [, navigate] = useLocation();
  const { me, loading } = useMe();
  const calculatorEnabled = import.meta.env.VITE_CALCULATOR_ENABLED === 'true';

  useEffect(() => {
    if (!loading && me && calculatorEnabled) {
      navigate('/baker/calculator');
    }
  }, [loading, me, calculatorEnabled, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (me && calculatorEnabled) {
    return null;
  }

  return <CakeCalculator bakerId="567d2421-7a5a-454f-8cc8-66b2f5f803f8" />;
}
