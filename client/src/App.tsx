import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { TenantBrandProvider } from "@/components/TenantBrandProvider";
import Home from "@/pages/home";
import Signup from "@/pages/signup";
import DemoTenant from "@/pages/demo-tenant";
import CustomerLogin from "@/pages/customer-login";
import CustomerPortal from "@/pages/customer-portal";
import BakerDashboard from "@/components/BakerDashboard";
import { VenueAdminDashboard } from "@/components/VenueAdminDashboard";
import { SuperAdminDashboard } from "@/components/SuperAdminDashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
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
  );
}

export default App;
