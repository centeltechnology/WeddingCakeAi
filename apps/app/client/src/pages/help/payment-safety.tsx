import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Link } from "wouter";
import { Shield, Lock, CreditCard, AlertTriangle, CheckCircle, ArrowLeft, Eye } from "lucide-react";

export default function PaymentSafety() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex flex-col">
      <NavigationHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Navigation */}
          <div className="mb-6">
            <Link href="/help">
              <Button variant="ghost" className="mb-4 hover:bg-pink-50" data-testid="button-back-to-help">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Help Center
              </Button>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">Payment Safety & Security</h1>
            <p className="text-lg text-gray-600">
              How your payments and personal data are protected when using BakerIQ
            </p>
          </div>

          <div className="space-y-8">
            {/* Security Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2 text-green-600" />
                  Your Payment Security
                </CardTitle>
                <CardDescription>Industry-leading security measures to protect your transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">How We Protect You</h4>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                        <span className="text-gray-700"><strong>SSL Encryption:</strong> All data is encrypted during transmission</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                        <span className="text-gray-700"><strong>PCI DSS Compliance:</strong> We meet strict payment industry standards</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                        <span className="text-gray-700"><strong>Secure Storage:</strong> Payment details are never stored on our servers</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                        <span className="text-gray-700"><strong>Fraud Detection:</strong> Advanced systems monitor for suspicious activity</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Payment Processing</h4>
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-2">Powered by Stripe</h5>
                      <p className="text-sm text-blue-800 mb-3">
                        All payments are processed by Stripe, a leading payment processor trusted by millions of businesses worldwide.
                      </p>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• Used by companies like Amazon, Google, and Shopify</li>
                        <li>• Processes hundreds of billions in transactions annually</li>
                        <li>• Certified at the highest level of security standards</li>
                        <li>• Your card details never touch our servers</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Accepted Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                  Accepted Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border border-gray-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">Credit & Debit Cards</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                        <span>Visa</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                        <span>Mastercard</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
                        <span>American Express</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                        <span>Discover</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">Digital Wallets</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-gray-800 rounded-full mr-2"></div>
                        <span>Apple Pay</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <span>Google Pay</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-700 rounded-full mr-2"></div>
                        <span>Samsung Pay</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">Bank Payments</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                        <span>ACH Bank Transfer</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></div>
                        <span>Direct Debit</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 bg-green-50 border border-green-200 p-4 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>All payment methods</strong> are processed with the same high level of security. Choose the option that's most convenient for you.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Data Protection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-purple-600" />
                  Personal Data Protection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">What Information We Collect</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="font-medium text-gray-800">Contact Information</p>
                          <p>Name, email address, phone number for order communication</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="font-medium text-gray-800">Order Details</p>
                          <p>Event information, delivery address, special requirements</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="font-medium text-gray-800">Payment Information</p>
                          <p>Processed securely by Stripe - we never see your card details</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">How We Protect Your Data</h4>
                      <div className="space-y-3 text-sm">
                        <div className="border-l-4 border-green-400 pl-4">
                          <p className="font-medium text-green-800">Encrypted Storage</p>
                          <p className="text-green-700">All personal data is encrypted both in transit and at rest</p>
                        </div>
                        <div className="border-l-4 border-blue-400 pl-4">
                          <p className="font-medium text-blue-800">Limited Access</p>
                          <p className="text-blue-700">Only authorized personnel can access customer information</p>
                        </div>
                        <div className="border-l-4 border-purple-400 pl-4">
                          <p className="font-medium text-purple-800">Regular Audits</p>
                          <p className="text-purple-700">We conduct regular security audits and updates</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Your Privacy Rights</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
                      <ul className="space-y-1">
                        <li>• Access your personal data at any time</li>
                        <li>• Request corrections to inaccurate information</li>
                        <li>• Delete your account and associated data</li>
                      </ul>
                      <ul className="space-y-1">
                        <li>• Control marketing communications</li>
                        <li>• Export your data in a readable format</li>
                        <li>• Contact our privacy team with concerns</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dispute Protection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                  Dispute Protection & Refunds
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Dispute Resolution Process</h4>
                      <div className="space-y-3">
                        <div className="border border-gray-200 p-3 rounded">
                          <h5 className="font-medium text-gray-800">Step 1: Contact the Baker</h5>
                          <p className="text-sm text-gray-600">First, try to resolve any issues directly with your baker through the platform messaging</p>
                        </div>
                        <div className="border border-gray-200 p-3 rounded">
                          <h5 className="font-medium text-gray-800">Step 2: Platform Mediation</h5>
                          <p className="text-sm text-gray-600">If needed, our support team can help mediate and find a fair solution</p>
                        </div>
                        <div className="border border-gray-200 p-3 rounded">
                          <h5 className="font-medium text-gray-800">Step 3: Refund Protection</h5>
                          <p className="text-sm text-gray-600">In cases of non-delivery or significant issues, you're protected by our refund policy</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Your Protection</h4>
                      <div className="space-y-3 text-sm">
                        <div className="bg-green-50 border border-green-200 p-3 rounded">
                          <p className="font-medium text-green-800">Secure Payments</p>
                          <p className="text-green-700">Your payment is held securely until you confirm satisfaction with your order</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                          <p className="font-medium text-blue-800">Quality Guarantee</p>
                          <p className="text-blue-700">All bakers on our platform are vetted and maintain quality standards</p>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 p-3 rounded">
                          <p className="font-medium text-purple-800">Communication Records</p>
                          <p className="text-purple-700">All order communications are recorded for your protection</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-2">When to Contact Support</h4>
                    <p className="text-sm text-orange-800 mb-2">
                      Contact our support team immediately if you experience:
                    </p>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• Baker becomes unresponsive after payment</li>
                      <li>• Significant quality issues with your order</li>
                      <li>• Non-delivery without valid explanation</li>
                      <li>• Unauthorized charges on your account</li>
                      <li>• Any suspicious activity or requests</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Safety Tips for Customers</CardTitle>
                <CardDescription>Best practices to ensure a safe and secure ordering experience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Before Ordering</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Review the baker's profile, photos, and customer reviews</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Communicate all details clearly through the platform</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Confirm delivery date, time, and location in writing</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Ask about ingredients if you have allergies</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">During the Process</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Keep all communication within the BakerIQ platform</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Never share your payment details outside the secure checkout</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Respond promptly to baker questions or requests</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Report any suspicious behavior immediately</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Red Flags to Watch For
                    </h4>
                    <ul className="text-sm text-red-800 space-y-1">
                      <li>• Baker requests payment outside the platform</li>
                      <li>• Pressure to pay immediately without proper consultation</li>
                      <li>• Unwillingness to provide detailed quotes or contracts</li>
                      <li>• Poor communication or very delayed responses</li>
                      <li>• Requests for personal information beyond what's necessary</li>
                      <li>• Prices that seem too good to be true</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}