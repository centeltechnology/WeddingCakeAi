import { Link } from 'wouter';
import { Button } from '@/components/ui/Button';
import AppLayout from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <AppLayout>
      <PageHeader title="404 - Page Not Found" subtitle="The page you're looking for doesn't exist" />
      
      <div className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="h-24 w-24 text-muted-foreground mb-6" />
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          The page you're trying to access doesn't exist or may have been moved.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => history.back()}>
            ← Go Back
          </Button>
          <Link href="/baker/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
