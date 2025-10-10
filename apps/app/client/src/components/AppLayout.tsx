import React from 'react';
import AppHeader from '@/components/AppHeader';

const AntiNestStyles = () => (
  <style>{`#marketing-nav{display:none!important;visibility:hidden!important}`}</style>
);

export default function AppLayout({ 
  children
}: { 
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <AntiNestStyles />
      <AppHeader />
      <main className="max-w-6xl mx-auto px-4 pt-6 pb-28">
        {children}
      </main>
    </div>
  );
}
