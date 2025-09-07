import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface TenantBranding {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl?: string;
  customMessages: {
    heroTitle?: string;
    heroSubtitle?: string;
    footerMessage?: string;
    emailSignature?: string;
  };
  customCss?: string;
}

interface TenantInfo {
  id: string;
  name: string;
  subdomain: string;
  customDomain?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  isActive: boolean;
}

interface TenantContextType {
  tenant: TenantInfo | null;
  branding: TenantBranding;
  isLoading: boolean;
  updateBranding: (updates: Partial<TenantBranding>) => Promise<void>;
}

const defaultBranding: TenantBranding = {
  primaryColor: '#B8860B',
  secondaryColor: '#F5E6B3',
  accentColor: '#8B7355',
  customMessages: {
    heroTitle: 'Design Your Dream Wedding Cake',
    heroSubtitle: 'Connect with expert bakers and visualize your perfect cake'
  }
};

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  branding: defaultBranding,
  isLoading: false,
  updateBranding: async () => {}
});

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantBrandProvider');
  }
  return context;
}

interface TenantBrandProviderProps {
  children: React.ReactNode;
}

export function TenantBrandProvider({ children }: TenantBrandProviderProps) {
  const [branding, setBranding] = useState<TenantBranding>(defaultBranding);

  const { data, isLoading } = useQuery<{ tenant: TenantInfo | null; config: any | null }>({
    queryKey: ['/api/tenant/info'],
    retry: false,
  });

  const tenant = data?.tenant || null;
  const config = data?.config;

  useEffect(() => {
    if (config) {
      const tenantBranding: TenantBranding = {
        primaryColor: config.primaryColor || defaultBranding.primaryColor,
        secondaryColor: config.secondaryColor || defaultBranding.secondaryColor,
        accentColor: config.accentColor || defaultBranding.accentColor,
        logoUrl: config.logoUrl,
        customMessages: {
          ...defaultBranding.customMessages,
          ...config.customMessages
        },
        customCss: config.customCss
      };
      setBranding(tenantBranding);
      
      // Apply CSS custom properties for theming
      applyCSSVariables(tenantBranding);
      
      // Apply custom CSS if provided
      if (tenantBranding.customCss) {
        applyCustomCSS(tenantBranding.customCss);
      }
    } else {
      setBranding(defaultBranding);
      applyCSSVariables(defaultBranding);
    }
  }, [config]);

  const updateBranding = async (updates: Partial<TenantBranding>) => {
    if (!tenant) return;
    
    try {
      const response = await fetch('/api/tenant/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update branding');
      }
      
      const updatedConfig = await response.json();
      setBranding(prev => ({
        ...prev,
        ...updates
      }));
      
      // Re-apply CSS variables
      applyCSSVariables({
        ...branding,
        ...updates
      });
      
      if (updates.customCss) {
        applyCustomCSS(updates.customCss);
      }
    } catch (error) {
      console.error('Error updating branding:', error);
      throw error;
    }
  };

  return (
    <TenantContext.Provider value={{ tenant, branding, isLoading, updateBranding }}>
      {children}
    </TenantContext.Provider>
  );
}

function applyCSSVariables(branding: TenantBranding) {
  const root = document.documentElement;
  
  // Convert hex colors to HSL for better CSS custom property support
  const primaryHSL = hexToHSL(branding.primaryColor);
  const secondaryHSL = hexToHSL(branding.secondaryColor);
  const accentHSL = hexToHSL(branding.accentColor);
  
  root.style.setProperty('--primary', primaryHSL);
  root.style.setProperty('--secondary', secondaryHSL);
  root.style.setProperty('--accent', accentHSL);
  
  // Set variations for different states
  root.style.setProperty('--primary-foreground', 'hsl(0, 0%, 98%)');
  root.style.setProperty('--secondary-foreground', 'hsl(0, 0%, 9%)');
  root.style.setProperty('--accent-foreground', 'hsl(0, 0%, 9%)');
  
  // Muted variations
  const mutedPrimary = adjustHSL(primaryHSL, { s: -20, l: 10 });
  const mutedSecondary = adjustHSL(secondaryHSL, { s: -10, l: 5 });
  
  root.style.setProperty('--muted', mutedSecondary);
  root.style.setProperty('--muted-foreground', 'hsl(0, 0%, 45%)');
}

function applyCustomCSS(customCSS: string) {
  // Remove existing custom CSS
  const existingStyle = document.getElementById('tenant-custom-css');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Add new custom CSS
  const style = document.createElement('style');
  style.id = 'tenant-custom-css';
  style.textContent = customCSS;
  document.head.appendChild(style);
}

function hexToHSL(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function adjustHSL(hsl: string, adjustments: { h?: number; s?: number; l?: number }): string {
  const [h, s, l] = hsl.split(' ').map((v, i) => {
    const num = parseInt(v);
    if (i === 0) return Math.max(0, Math.min(360, num + (adjustments.h || 0)));
    return Math.max(0, Math.min(100, num + (adjustments.s || 0)));
  });
  
  return `${h} ${s}% ${l}%`;
}