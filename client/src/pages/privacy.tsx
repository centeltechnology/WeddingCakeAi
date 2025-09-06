import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex flex-col">
      <NavigationHeader />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none space-y-8">
            <div>
              <p className="text-gray-600 mb-6">
                <strong>Last updated:</strong> {new Date().toLocaleDateString()}
              </p>
              
              <p className="text-gray-700 leading-relaxed">
                This Privacy Policy describes how Bakewise collects, uses, and protects your personal information when you use our cake ordering and baker management platform.
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Information We Collect</h2>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Personal Information</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Name, email address, and contact information</li>
                <li>Business information (for bakers)</li>
                <li>Event details and preferences</li>
                <li>Payment information (processed securely by third parties)</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">Usage Information</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Platform usage and interaction data</li>
                <li>Device information and IP addresses</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">How We Use Your Information</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Facilitate connections between customers and bakers</li>
                <li>Process orders, quotes, and payments</li>
                <li>Communicate important updates and notifications</li>
                <li>Improve our platform and user experience</li>
                <li>Comply with legal obligations and prevent fraud</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Information Sharing</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We share your information only as necessary:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>With bakers to fulfill your orders (name, contact info, event details)</li>
                <li>With customers (baker business information and portfolio)</li>
                <li>With service providers (payment processing, email services)</li>
                <li>As required by law or to protect our rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Data Security</h2>
              <p className="text-gray-700 leading-relaxed">
                We implement industry-standard security measures including encryption, secure data storage, and regular security audits. However, no online platform can guarantee 100% security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Your Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Access and update your personal information</li>
                <li>Delete your account and associated data</li>
                <li>Opt-out of marketing communications</li>
                <li>Request a copy of your data</li>
                <li>Report data protection concerns</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Cookies and Tracking</h2>
              <p className="text-gray-700 leading-relaxed">
                We use cookies to enhance your experience, remember preferences, and analyze platform usage. You can control cookie settings through your browser, though some features may not work properly without them.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your information as long as your account is active or as needed to provide services. We may retain some information for legal compliance, fraud prevention, and legitimate business purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy periodically. We'll notify you of significant changes via email or platform notifications.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                For privacy-related questions or requests, contact us at <a href="mailto:privacy@bakewise.com" className="text-pink-600 hover:text-pink-800">privacy@bakewise.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}