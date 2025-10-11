import { useState, type ComponentType, type ElementType } from 'react';
import { useLocation } from 'wouter';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/PageHeader';
import { cn } from '@/lib/utils';
import { Calculator, User, Share2, CreditCard, Image, Calendar, Bell, Mail, Zap, History, FileDown } from 'lucide-react';
import BusinessProfile from './settings/BusinessProfile';
import SocialLinks from './settings/SocialLinks';
import PaymentOptions from './settings/PaymentOptions';
import MediaLibrary from './settings/MediaLibrary';
import BookingSettings from './settings/BookingSettings';
import AutoReplySettings from './settings/AutoReplySettings';
import AutoReplyTemplates from './settings/AutoReplyTemplates';
import AutoReplyRules from './settings/AutoReplyRules';
import AutoReplyLogs from './settings/AutoReplyLogs';
import ImportData from './settings/ImportData';

type Tab = {
  id: string;
  label: string;
  icon: ElementType;
  component: ComponentType<{ embedded?: boolean }>;
  enabled: boolean;
};

export default function SettingsHub() {
  const [, setLocation] = useLocation();
  const calculatorEnabled = import.meta.env.VITE_CALCULATOR_ENABLED === 'true';
  const bookingEnabled = import.meta.env.VITE_BOOKING_ENABLED === 'true';
  const autoReplyEnabled = import.meta.env.VITE_AUTO_REPLY_ENABLED === 'true';

  const tabs: Tab[] = [
    { id: 'profile', label: 'Business Profile', icon: User, component: BusinessProfile, enabled: true },
    { id: 'social', label: 'Social Links', icon: Share2, component: SocialLinks, enabled: true },
    { id: 'payment', label: 'Payment Options', icon: CreditCard, component: PaymentOptions, enabled: true },
    { id: 'media', label: 'Media Library', icon: Image, component: MediaLibrary, enabled: true },
    { id: 'import', label: 'Import Data', icon: FileDown, component: ImportData, enabled: true },
    { id: 'booking', label: 'Booking', icon: Calendar, component: BookingSettings, enabled: bookingEnabled },
    { id: 'auto-reply-settings', label: 'Auto-Reply Settings', icon: Bell, component: AutoReplySettings, enabled: autoReplyEnabled },
    { id: 'auto-reply-templates', label: 'Email Templates', icon: Mail, component: AutoReplyTemplates, enabled: autoReplyEnabled },
    { id: 'auto-reply-rules', label: 'Auto-Reply Rules', icon: Zap, component: AutoReplyRules, enabled: autoReplyEnabled },
    { id: 'auto-reply-logs', label: 'Activity Logs', icon: History, component: AutoReplyLogs, enabled: autoReplyEnabled },
  ].filter((tab) => tab.enabled);

  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component || BusinessProfile;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
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
                        'flex items-center gap-3 w-full px-3 py-2 rounded-xl text-left transition-colors',
                        'focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white',
                        activeTab === tab.id
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-black'
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
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
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-left transition-colors text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  >
                    <Calculator className="w-4 h-4" />
                    Calculator Settings
                  </button>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="col-span-12 md:col-span-9">
            <ActiveComponent embedded={true} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
