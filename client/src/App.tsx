import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { TenantBrandProvider } from "@/components/TenantBrandProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
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
import { SuperAdminDashboard } from "@/components/SuperAdminDashboard";
import { CakeCalculator } from "@/components/CakeCalculator";
import NotFound from "@/pages/not-found";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import Cookies from "@/pages/cookies";
import AcceptableUse from "@/pages/acceptable-use";
import Help from "@/pages/help";
import Settings from "@/pages/Settings";
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
import SuperAdminLogin from "@/pages/super-admin-login";
import SuperAdminSetup from "@/pages/super-admin-setup";
import BakerLogin from "@/pages/baker-login";
import Billing from "@/pages/billing";
import { SuperAdminAuthWrapper } from "@/components/SuperAdminAuthWrapper";
import { BakerAuthWrapper } from "@/components/BakerAuthWrapper";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import React, { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/features" component={Features} />
      <Route path="/about" component={About} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/signup" component={Signup} />
      <Route path="/demo-tenant" component={DemoTenant} />
      <Route path="/customer-login" component={CustomerLogin} />
      <Route path="/customer-portal" component={() => <CustomerPortal customerId="customer-1" />} />
      <Route path="/customer-portal/:id">
        {(params) => <CustomerPortal customerId={params.id} />}
      </Route>
      <Route path="/baker/:id/dashboard">
        {(params) => (
          <BakerAuthWrapper bakerId={params.id}>
            <BakerDashboard bakerId={params.id} />
          </BakerAuthWrapper>
        )}
      </Route>
      <Route path="/admin">
        {() => (
          <BakerAuthWrapper bakerId="70c29a5d-72f3-443f-8c39-c2ced5210f05">
            <BakerDashboard bakerId="70c29a5d-72f3-443f-8c39-c2ced5210f05" />
          </BakerAuthWrapper>
        )}
      </Route>
      <Route path="/baker-login" component={BakerLogin} />
      <Route path="/super-admin-setup" component={SuperAdminSetup} />
      <Route path="/super-admin-login" component={SuperAdminLogin} />
      <Route path="/super-admin" component={() => (
        <SuperAdminAuthWrapper>
          <SuperAdminDashboard />
        </SuperAdminAuthWrapper>
      )} />
      <Route path="/baker/:bakerId/calculator">
        {(params) => <CakeCalculator bakerId={params.bakerId} />}
      </Route>
      <Route path="/calculator" component={() => <CakeCalculator bakerId="70c29a5d-72f3-443f-8c39-c2ced5210f05" />} />
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
      <Route path="/settings" component={Settings} />
      <Route path="/billing" component={Billing} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="wedding-cake-theme">
          <TenantBrandProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
              <ScrollToTopButton />
            </TooltipProvider>
          </TenantBrandProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
