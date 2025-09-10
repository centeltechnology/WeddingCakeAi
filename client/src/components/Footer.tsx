import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";
import { useTenant } from "@/components/TenantBrandProvider";

export function Footer() {
  const { tenant } = useTenant();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto relative z-10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-serif font-bold text-gray-900">
              {tenant?.name || 'Bakewise'}
            </h3>
            <p className="text-sm text-gray-600">
              Professional cake ordering and baker management platform. 
              Connect customers with expert bakers for perfect celebrations.
            </p>
          </div>

          {/* Platform Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/features" className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer block py-1" data-testid="footer-features">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer block py-1" data-testid="footer-pricing">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer block py-1" data-testid="footer-about">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer block py-1" data-testid="footer-baker-login">
                  Baker Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:support@bakewiseapp.com" className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer block py-1" data-testid="footer-contact">
                  Contact Support
                </a>
              </li>
              <li>
                <Link href="/help" className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer block py-1" data-testid="footer-help">
                  Help Center
                </Link>
              </li>
              <li>
                <a href="mailto:hello@bakewiseapp.com" className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer block py-1" data-testid="footer-business">
                  Business Inquiries
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer block py-1" data-testid="footer-terms">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer block py-1" data-testid="footer-privacy">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer block py-1" data-testid="footer-cookies">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/acceptable-use" className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer block py-1" data-testid="footer-acceptable-use">
                  Acceptable Use
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-gray-600">
            © {currentYear} {tenant?.name || 'Bakewise'}. All rights reserved.
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <span>Made with ❤️ for bakers everywhere</span>
          </div>
        </div>
      </div>
    </footer>
  );
}