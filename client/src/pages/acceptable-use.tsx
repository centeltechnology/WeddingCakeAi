import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";

export default function AcceptableUse() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex flex-col">
      <NavigationHeader />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-8">Acceptable Use Policy</h1>
          
          <div className="prose prose-lg max-w-none space-y-8">
            <div>
              <p className="text-gray-600 mb-6">
                <strong>Last updated:</strong> {new Date().toLocaleDateString()}
              </p>
              
              <p className="text-gray-700 leading-relaxed">
                This Acceptable Use Policy governs your use of Bakewise and outlines prohibited activities to ensure a safe, professional environment for all users.
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Permitted Uses</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Bakewise is designed for legitimate business purposes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Connecting customers with professional bakers</li>
                <li>Managing cake orders, quotes, and contracts</li>
                <li>Processing payments for legitimate transactions</li>
                <li>Marketing bakery services and portfolio content</li>
                <li>Building professional relationships in the baking industry</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Prohibited Activities</h2>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Illegal Activities</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
                <li>Violating any applicable laws or regulations</li>
                <li>Operating without required food service licenses</li>
                <li>Fraudulent business practices or misrepresentation</li>
                <li>Money laundering or payment fraud</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">Platform Abuse</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
                <li>Creating fake accounts or impersonating others</li>
                <li>Automated scraping or data harvesting</li>
                <li>Circumventing security measures or access controls</li>
                <li>Overloading systems or attempting denial-of-service attacks</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">Content Violations</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
                <li>Uploading offensive, discriminatory, or inappropriate content</li>
                <li>Posting misleading product descriptions or pricing</li>
                <li>Using copyrighted images without permission</li>
                <li>Sharing explicit or adult content</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">Business Conduct</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Discriminating against customers based on protected characteristics</li>
                <li>Deliberately misleading customers about allergens or ingredients</li>
                <li>Failing to disclose material business information</li>
                <li>Engaging in predatory or unfair pricing practices</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Professional Standards</h2>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-3">For Bakers</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
                <li>Maintain current food safety certifications</li>
                <li>Provide accurate business and contact information</li>
                <li>Respond promptly to customer inquiries</li>
                <li>Honor quoted prices and delivery commitments</li>
                <li>Maintain professional communication standards</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">For Customers</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide accurate event and contact information</li>
                <li>Communicate dietary restrictions clearly</li>
                <li>Make payments according to agreed terms</li>
                <li>Treat bakers with respect and professionalism</li>
                <li>Provide reasonable access for delivery and setup</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Reporting Violations</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you encounter violations of this policy, please report them immediately:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Email: <a href="mailto:abuse@bakewise.com" className="text-pink-600 hover:text-pink-800">abuse@bakewise.com</a></li>
                <li>Use the "Report" function within the platform</li>
                <li>Contact customer support for urgent safety concerns</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Enforcement Actions</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Violations may result in:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Warning notices and required corrective action</li>
                <li>Temporary suspension of account privileges</li>
                <li>Permanent account termination</li>
                <li>Referral to law enforcement for illegal activities</li>
                <li>Legal action to recover damages</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Appeals Process</h2>
              <p className="text-gray-700 leading-relaxed">
                If you believe enforcement action was taken in error, you may appeal by emailing <a href="mailto:appeals@bakewise.com" className="text-pink-600 hover:text-pink-800">appeals@bakewise.com</a> within 30 days of the action. Include relevant evidence and a detailed explanation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Policy Updates</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this policy to address new issues or clarify existing rules. Continued use of the platform constitutes acceptance of policy changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                Questions about this policy? Contact us at <a href="mailto:legal@bakewise.com" className="text-pink-600 hover:text-pink-800">legal@bakewise.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}