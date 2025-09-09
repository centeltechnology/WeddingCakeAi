import session from "express-session";

declare module "express-session" {
  interface SessionData {
    bakerId?: string;
    customerId?: string;
    userId?: string;
    role?: string;
    isAuthenticated?: boolean;
    loginTime?: number;
  }
}