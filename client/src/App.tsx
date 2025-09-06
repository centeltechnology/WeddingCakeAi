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
        {(params) => <BakerDashboard bakerId={params.id} />}
      </Route>
      <Route path="/admin">
        {() => <BakerDashboard bakerId="baker-1" />}
      </Route>
      <Route path="/super-admin" component={() => <SuperAdminDashboard />} />
      <Route path="/baker/:bakerId/calculator">
        {(params) => <CakeCalculator bakerId={params.bakerId} />}
      </Route>
      <Route path="/calculator" component={() => <CakeCalculator bakerId="baker-1" />} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/cookies" component={Cookies} />
      <Route path="/acceptable-use" component={AcceptableUse} />
      <Route path="/help" component={Help} />
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
            </TooltipProvider>
          </TenantBrandProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
