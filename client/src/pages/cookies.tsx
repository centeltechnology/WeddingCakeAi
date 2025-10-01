import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";

export default function Cookies() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex flex-col">
      <NavigationHeader />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-8">Cookie Policy</h1>
          
          <div className="prose prose-lg max-w-none space-y-8">
            <div>
              <p className="text-gray-600 mb-6">
                <strong>Last updated:</strong> {new Date().toLocaleDateString()}
              </p>
              
              <p className="text-gray-700 leading-relaxed">
                This Cookie Policy explains how BakerIQ uses cookies and similar technologies to enhance your experience on our platform.
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">What Are Cookies?</h2>
              <p className="text-gray-700 leading-relaxed">
                Cookies are small text files placed on your device by websites you visit. They help websites remember your preferences, improve functionality, and provide insights into how the site is used.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Types of Cookies We Use</h2>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Essential Cookies</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Required for the platform to function properly. These enable core features like:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
                <li>User authentication and account access</li>
                <li>Shopping cart and order processing</li>
                <li>Security and fraud prevention</li>
                <li>Basic platform functionality</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">Performance Cookies</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Help us understand how visitors interact with our platform:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
                <li>Page views and user flow analysis</li>
                <li>Platform performance monitoring</li>
                <li>Error tracking and debugging</li>
                <li>Load time optimization</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">Functionality Cookies</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Remember your preferences and personalize your experience:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
                <li>Language and region preferences</li>
                <li>Theme and display settings</li>
                <li>Recently viewed items</li>
                <li>Form auto-fill information</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">Marketing Cookies</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Used to deliver relevant content and measure campaign effectiveness:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Targeted advertising and promotions</li>
                <li>Social media integration</li>
                <li>Marketing campaign performance</li>
                <li>Cross-platform user tracking</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We work with trusted partners who may place cookies on your device:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Payment Processors:</strong> Stripe for secure transactions</li>
                <li><strong>Analytics:</strong> Google Analytics for usage insights</li>
                <li><strong>Email Services:</strong> Mailjet for communication</li>
                <li><strong>Cloud Services:</strong> AWS for platform infrastructure</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Managing Your Cookie Preferences</h2>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Browser Settings</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Most browsers allow you to control cookies through their settings:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
                <li>Block all cookies (may affect functionality)</li>
                <li>Block third-party cookies only</li>
                <li>Delete existing cookies</li>
                <li>Set preferences for future cookies</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">Platform Controls</h3>
              <p className="text-gray-700 leading-relaxed">
                Logged-in users can manage certain preferences through their account settings, including marketing communications and data sharing options.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Cookie Lifespan</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
                <li><strong>Persistent Cookies:</strong> Remain until expiration or manual deletion</li>
                <li><strong>Essential Cookies:</strong> Typically 1-12 months</li>
                <li><strong>Analytics Cookies:</strong> Usually 2 years maximum</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Your Consent</h2>
              <p className="text-gray-700 leading-relaxed">
                By continuing to use our platform, you consent to our use of cookies as described in this policy. You can withdraw consent at any time by adjusting your browser settings or contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Updates to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Cookie Policy to reflect changes in technology, legislation, or our practices. Check this page periodically for updates.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                For questions about our cookie practices, email us at <a href="mailto:privacy@bakeriq.app" className="text-pink-600 hover:text-pink-800">privacy@bakeriq.app</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}