import { useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { TenantBrandProvider } from "@/components/TenantBrandProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { loadGoogleMaps } from "@/lib/googleMaps";
import Home from "@/pages/home";
import Features from "@/pages/features";
import About from "@/pages/about";
import Pricing from "@/pages/pricing";
import Signup from "@/pages/signup";
import DemoTenant from "@/pages/demo-tenant";
import CustomerLogin from "@/pages/customer-login";
import CustomerPortal from "@/pages/customer-portal";
import BakerDashboard from "@/components/BakerDashboard";
import { VenueAdminDashboard } from "@/components/VenueAdminDashboard";
import SuperAdminDashboard from "@/pages/SuperAdminDashboard";
import { CakeCalculator } from "@/components/CakeCalculator";
import NotFound from "@/pages/not-found";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import Cookies from "@/pages/cookies";
import AcceptableUse from "@/pages/acceptable-use";
import Help from "@/pages/help";
import Settings from "@/pages/Settings";
import BusinessProfile from "@/pages/settings/BusinessProfile";
import SocialLinks from "@/pages/settings/SocialLinks";
import PaymentOptions from "@/pages/settings/PaymentOptions";
import MediaLibrary from "@/pages/settings/MediaLibrary";
import SubdomainSetup from "@/pages/help/subdomain-setup";
import QuoteTemplates from "@/pages/help/quote-templates";
import CustomCakeOrdering from "@/pages/help/custom-cake-ordering";
import QuotesAndContracts from "@/pages/help/quotes-and-contracts";
import DietaryRestrictions from "@/pages/help/dietary-restrictions";
import EventPlanningTips from "@/pages/help/event-planning-tips";
import PaymentProcessing from "@/pages/help/payment-processing";
import CustomerCommunications from "@/pages/help/customer-communications";
import AnalyticsAndInsights from "@/pages/help/analytics-and-insights";
import MarketingYourBakery from "@/pages/help/marketing-your-bakery";
import PaymentSafety from "@/pages/help/payment-safety";
import ReviewsAndFeedback from "@/pages/help/reviews-and-feedback";
import AccountSetup from "@/pages/help/account-setup";
import SubscriptionPlans from "@/pages/help/subscription-plans";
import MobileApp from "@/pages/help/mobile-app";
import Notifications from "@/pages/help/notifications";
import Troubleshooting from "@/pages/help/troubleshooting";
import BrowserCompatibility from "@/pages/help/browser-compatibility";
import DataPrivacy from "@/pages/help/data-privacy";
import ApiIntegration from "@/pages/help/api-integration";
import SeoOptimization from "@/pages/help/seo-optimization";
import SocialMedia from "@/pages/help/social-media";
import CustomerRetention from "@/pages/help/customer-retention";
import PricingStrategies from "@/pages/help/pricing-strategies";
import Marketplace from "@/pages/marketplace";
import BakerProfile from "@/pages/baker-profile";
import Bakers from "@/pages/bakers";
import SuperAdminLogin from "@/pages/super-admin-login";
import SuperAdminSetup from "@/pages/super-admin-setup";
import SuperAdminForgotPassword from "@/pages/super-admin-forgot-password";
import SuperAdminResetPassword from "@/pages/super-admin-reset-password";
import BakerLogin from "@/pages/baker-login";
import BakerForgotPassword from "@/pages/baker-forgot-password";
import BakerResetPassword from "@/pages/baker-reset-password";
import AuthTest from "@/pages/auth-test";
import Billing from "@/pages/billing";
import VerifyEmail from "@/pages/verify-email";
import QuoteApprovalPage from "@/pages/quote-approval";
import ContractsList from "@/pages/ContractsList";
import ContractEdit from "@/pages/ContractEdit";
import ContractApprovalPage from "@/pages/contract-approval";
import InvoiceList from "@/pages/InvoiceList";
import InvoiceDetail from "@/pages/InvoiceDetail";
import { SuperAdminAuthWrapper } from "@/components/SuperAdminAuthWrapper";
import { BakerAuthWrapper } from "@/components/BakerAuthWrapper";
import { BakerSlugWrapper } from "@/components/BakerSlugWrapper";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import LoginPage from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import BakerDashboardPage from "@/pages/BakerDashboard";
import { AuthGuard } from "@/components/AuthGuard";
import { Redirect } from "wouter";
import ResetRequest from "@/pages/ResetRequest";
import ResetConfirm from "@/pages/ResetConfirm";
// AppShell deprecated - using AppLayout in pages instead
import AdminImpersonate from "@/pages/AdminImpersonate";
import AdvertiserCampaigns from "@/pages/AdvertiserCampaigns";
import AdvertiserReports from "@/pages/AdvertiserReports";
import AdminNetworkReports from "@/pages/AdminNetworkReports";
import { CreditsModalProvider } from "@/components/ai/CreditsModalContext";
import MessagesPage from "@/pages/Messages";
import QuoteList from "@/pages/QuoteList";
import { QuoteBuilder } from "@/components/QuoteBuilder";
import CustomersPage from "@/pages/Customers";
import AdminTenantsPage from "@/pages/AdminTenants";
import AdminUsersPage from "@/pages/AdminUsers";
import AILab from "@/pages/AILab";
import BakerCalculator from "@/pages/BakerCalculator";
import PublicCalculatorV1Redirect from "@/pages/PublicCalculatorV1Redirect";
import SettingsHub from "@/pages/SettingsHub";
import BookingList from "@/pages/settings/BookingList";
import BookingSettings from "@/pages/settings/BookingSettings";
import BookingPublic from "@/pages/BookingPublic";
import Leads from "@/pages/Leads";

function RootGate() {
  const [, navigate] = useLocation();
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/session", { credentials: "include", cache: "no-store" });
        const data = await res.json();
        const target = data?.authenticated ? "/baker/dashboard" : "/login";
        navigate(target, { replace: true });
      } catch {
        navigate("/login", { replace: true });
      }
    })();
  }, [navigate]);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <RootGate />
      </Route>
      <Route path="/login" component={LoginPage} />
      <Route path="/reset" component={ResetRequest} />
      <Route path="/reset/:token" component={ResetConfirm} />
      <Route path="/dashboard">
        <AuthGuard>
          <Dashboard />
        </AuthGuard>
      </Route>
      <Route path="/home" component={Home} />
      <Route path="/features" component={Features} />
      <Route path="/about" component={About} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/signup" component={Signup} />
      <Route path="/demo-tenant" component={DemoTenant} />
      <Route path="/demo/:slug">
        {(params) => (
          <BakerSlugWrapper slug={params.slug}>
            <DemoTenant />
          </BakerSlugWrapper>
        )}
      </Route>
      {/* Customer login routes removed per user request */}
      <Route path="/baker/:slug/dashboard">
        {(params) => (
          <BakerSlugWrapper slug={params.slug}>
            <BakerDashboard bakerId="" />
          </BakerSlugWrapper>
        )}
      </Route>
      <Route path="/dashboard/:id">
        {(params) => (
          <BakerAuthWrapper bakerId={params.id}>
            <BakerDashboard bakerId={params.id} />
          </BakerAuthWrapper>
        )}
      </Route>
      <Route path="/admin">
        {() => (
          <BakerAuthWrapper bakerId="567d2421-7a5a-454f-8cc8-66b2f5f803f8">
            <BakerDashboard bakerId="567d2421-7a5a-454f-8cc8-66b2f5f803f8" />
          </BakerAuthWrapper>
        )}
      </Route>
      <Route path="/admin/impersonate">
        <AuthGuard>
          <AdminImpersonate />
        </AuthGuard>
      </Route>
      <Route path="/baker/dashboard">
        <AuthGuard>
          <BakerDashboardPage />
        </AuthGuard>
      </Route>
      <Route path="/baker-login" component={BakerLogin} />
      <Route path="/baker/forgot-password" component={BakerForgotPassword} />
      <Route path="/baker-forgot-password" component={BakerForgotPassword} />
      <Route path="/baker/reset-password" component={BakerResetPassword} />
      <Route path="/baker-reset-password" component={BakerResetPassword} />
      <Route path="/login" component={BakerLogin} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/auth-test" component={AuthTest} />
      <Route path="/super-admin-setup" component={SuperAdminSetup} />
      <Route path="/super-admin-login" component={SuperAdminLogin} />
      <Route path="/super-admin-forgot-password" component={SuperAdminForgotPassword} />
      <Route path="/super-admin" component={() => (
        <SuperAdminAuthWrapper>
          <SuperAdminDashboard />
        </SuperAdminAuthWrapper>
      )} />
      <Route path="/super-admin/reset-password" component={SuperAdminResetPassword} />
      {/* Tenant-based calculator route (e.g. /baker/sweet-dreams-bakery/calculator) */}
      <Route path="/baker/:slug/calculator">
        {(params) => (
          <BakerSlugWrapper slug={params.slug}>
            <CakeCalculator />
          </BakerSlugWrapper>
        )}
      </Route>
      {/* Authenticated Baker Calculator */}
      <Route path="/baker/calculator">
        <AuthGuard>
          <BakerCalculator />
        </AuthGuard>
      </Route>
      {/* Public Calculator - redirects to /baker/calculator if authenticated */}
      <Route path="/calculator" component={PublicCalculatorV1Redirect} />
      {/* Direct baker ID calculator route */}
      <Route path="/calculator/:bakerId">
        {(params) => <CakeCalculator bakerId={params.bakerId} />}
      </Route>
      <Route path="/quote-approval/:token" component={QuoteApprovalPage} />
      <Route path="/contract-approval/:token" component={ContractApprovalPage} />
      <Route path="/contracts">
        <AuthGuard>
          <ContractsList />
        </AuthGuard>
      </Route>
      <Route path="/contracts/:id">
        <AuthGuard>
          <ContractEdit />
        </AuthGuard>
      </Route>
      <Route path="/invoices">
        <AuthGuard>
          <InvoiceList />
        </AuthGuard>
      </Route>
      <Route path="/invoices/:id">
        <AuthGuard>
          <InvoiceDetail />
        </AuthGuard>
      </Route>
      <Route path="/ai-lab">
        <AuthGuard>
          <AILab />
        </AuthGuard>
      </Route>
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/cookies" component={Cookies} />
      <Route path="/acceptable-use" component={AcceptableUse} />
      <Route path="/help" component={Help} />
      <Route path="/help/subdomain-setup" component={SubdomainSetup} />
      <Route path="/help/quote-templates" component={QuoteTemplates} />
      <Route path="/help/custom-cake-ordering" component={CustomCakeOrdering} />
      <Route path="/help/quotes-and-contracts" component={QuotesAndContracts} />
      <Route path="/help/dietary-restrictions" component={DietaryRestrictions} />
      <Route path="/help/event-planning-tips" component={EventPlanningTips} />
      <Route path="/help/payment-processing" component={PaymentProcessing} />
      <Route path="/help/customer-communications" component={CustomerCommunications} />
      <Route path="/help/analytics-and-insights" component={AnalyticsAndInsights} />
      <Route path="/help/marketing-your-bakery" component={MarketingYourBakery} />
      <Route path="/help/payment-safety" component={PaymentSafety} />
      <Route path="/help/reviews-and-feedback" component={ReviewsAndFeedback} />
      <Route path="/help/account-setup" component={AccountSetup} />
      <Route path="/help/subscription-plans" component={SubscriptionPlans} />
      <Route path="/help/mobile-app" component={MobileApp} />
      <Route path="/help/notifications" component={Notifications} />
      <Route path="/help/troubleshooting" component={Troubleshooting} />
      <Route path="/help/browser-compatibility" component={BrowserCompatibility} />
      <Route path="/help/data-privacy" component={DataPrivacy} />
      <Route path="/help/api-integration" component={ApiIntegration} />
      <Route path="/help/seo-optimization" component={SeoOptimization} />
      <Route path="/help/social-media" component={SocialMedia} />
      <Route path="/help/customer-retention" component={CustomerRetention} />
      <Route path="/help/pricing-strategies" component={PricingStrategies} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/bakers" component={Bakers} />
      <Route path="/baker/:slug" component={BakerProfile} />
      <Route path="/baker/:slug/profile" component={BakerProfile} />
      <Route path="/settings" component={SettingsHub} />
      <Route path="/settings/profile" component={BusinessProfile} />
      <Route path="/settings/social" component={SocialLinks} />
      <Route path="/settings/payments" component={PaymentOptions} />
      <Route path="/settings/media" component={MediaLibrary} />
      <Route path="/settings/booking" component={BookingSettings} />
      <Route path="/account-settings" component={Settings} />
      <Route path="/bookings">
        <AuthGuard>
          <BookingList />
        </AuthGuard>
      </Route>
      <Route path="/book" component={BookingPublic} />
      <Route path="/billing" component={Billing} />
      <Route path="/advertiser/campaigns/new" component={AdvertiserCampaigns} />
      <Route path="/advertiser/reports" component={AdvertiserReports} />
      <Route path="/admin/reports/network" component={AdminNetworkReports} />
      
      {/* Placeholder pages for nav links */}
      <Route path="/messages">
        <MessagesPage />
      </Route>
      <Route path="/quotes">
        <AuthGuard>
          <QuoteList />
        </AuthGuard>
      </Route>
      <Route path="/quotes/new">
        <AuthGuard>
          <QuoteBuilder bakerId="" />
        </AuthGuard>
      </Route>
      <Route path="/quotes/:id">
        {(params) => (
          <AuthGuard>
            <QuoteBuilder bakerId="" />
          </AuthGuard>
        )}
      </Route>
      <Route path="/customers">
        <CustomersPage />
      </Route>
      <Route path="/leads">
        <AuthGuard>
          <Leads />
        </AuthGuard>
      </Route>
      <Route path="/admin/tenants">
        <AdminTenantsPage />
      </Route>
      <Route path="/admin/users">
        <AdminUsersPage />
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    loadGoogleMaps().catch(error => {
      console.error('Failed to load Google Maps:', error);
    });
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="wedding-cake-theme">
          <TenantBrandProvider>
            <TooltipProvider>
              <CreditsModalProvider>
                <Toaster />
                <Router />
                <ScrollToTopButton />
              </CreditsModalProvider>
            </TooltipProvider>
          </TenantBrandProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
