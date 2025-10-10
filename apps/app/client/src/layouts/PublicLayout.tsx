import { NavigationHeader } from '@/components/NavigationHeader';
import { Footer } from '@/components/Footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div id="marketing-nav">
        <NavigationHeader />
      </div>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
