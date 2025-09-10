import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex flex-col">
      <NavigationHeader />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none space-y-8">
            <div>
              <p className="text-gray-600 mb-6">
                <strong>Last updated:</strong> {new Date().toLocaleDateString()}
              </p>
              
              <p className="text-gray-700 leading-relaxed">
                Welcome to Bakewise. These Terms of Service ("Terms") govern your use of our platform that connects customers with professional bakers for custom cake orders and related services.
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing or using Bakewise, you agree to be bound by these Terms. If you disagree with any part of these terms, you may not access the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Bakewise is a marketplace platform that:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Connects customers with professional bakers</li>
                <li>Facilitates cake ordering, quoting, and contract management</li>
                <li>Provides tools for bakers to manage their business operations</li>
                <li>Enables secure payment processing between parties</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To use certain features, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized account use</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">4. Baker Responsibilities</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Professional bakers using our platform agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Maintain proper food handling licenses and certifications</li>
                <li>Provide accurate product descriptions and pricing</li>
                <li>Fulfill orders according to agreed specifications and timelines</li>
                <li>Maintain professional communication with customers</li>
                <li>Comply with local health and safety regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">5. Customer Responsibilities</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Customers using our platform agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide accurate order specifications and event details</li>
                <li>Make payments according to agreed terms</li>
                <li>Communicate dietary restrictions and allergies clearly</li>
                <li>Arrange appropriate venue access for delivery and setup</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">6. Payments and Refunds</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Payment terms are established between customers and bakers. Bakewise facilitates secure payment processing but is not responsible for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Disputes over order quality or specifications</li>
                <li>Refund decisions (governed by individual baker policies)</li>
                <li>Payment delays between parties</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed">
                Bakewise retains ownership of our platform, design, and technology. Bakers retain rights to their original cake designs and recipes. Users grant us license to use submitted content for platform operation and marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                Bakewise serves as a marketplace platform. We are not liable for the quality, safety, or legality of items offered by bakers, or the ability of bakers to complete orders. Our liability is limited to the maximum extent permitted by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">9. Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We may terminate or suspend accounts for violations of these Terms, illegal activity, or at our discretion. Users may terminate their accounts at any time through their account settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">10. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                For questions about these Terms, please contact us at <a href="mailto:legal@bakewiseapp.com" className="text-pink-600 hover:text-pink-800">legal@bakewiseapp.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}