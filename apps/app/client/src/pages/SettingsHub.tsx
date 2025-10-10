import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/PageHeader';
import { cn } from '@/lib/utils';
import { Calculator, User, Share2, CreditCard, Image, Calendar, Settings as SettingsIcon } from 'lucide-react';
import BusinessProfile from './settings/BusinessProfile';
import SocialLinks from './settings/SocialLinks';
import PaymentOptions from './settings/PaymentOptions';
import MediaLibrary from './settings/MediaLibrary';
import BookingSettings from './settings/BookingSettings';

type Tab = {
  id: string;
  label: string;
  icon: React.ElementType;
  component: React.ComponentType;
  enabled: boolean;
};

export default function SettingsHub() {
  const [, setLocation] = useLocation();
  const calculatorEnabled = import.meta.env.VITE_CALCULATOR_ENABLED === 'true';
  const bookingEnabled = import.meta.env.VITE_BOOKING_ENABLED === 'true';

  const tabs: Tab[] = [
    { id: 'profile', label: 'Business Profile', icon: User, component: BusinessProfile, enabled: true },
    { id: 'social', label: 'Social Links', icon: Share2, component: SocialLinks, enabled: true },
    { id: 'payment', label: 'Payment Options', icon: CreditCard, component: PaymentOptions, enabled: true },
    { id: 'media', label: 'Media Library', icon: Image, component: MediaLibrary, enabled: true },
    { id: 'booking', label: 'Booking', icon: Calendar, component: BookingSettings, enabled: bookingEnabled },
  ].filter((tab) => tab.enabled);

  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component || BusinessProfile;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Settings"
        subtitle="Manage your business profile and preferences"
      />

      <div className="grid grid-cols-12 gap-6 mt-6">
        <div className="col-span-12 md:col-span-3">
          <Card>
            <CardContent className="p-3">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left transition-colors',
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>

          {calculatorEnabled && (
            <Card className="mt-4">
              <CardContent className="p-3">
                <button
                  onClick={() => setLocation('/calculator')}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left hover:bg-muted transition-colors"
                >
                  <Calculator className="w-4 h-4" />
                  Calculator Settings
                </button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="col-span-12 md:col-span-9">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
}
