import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CreditCard, Shield, DollarSign, TrendingUp, AlertCircle, CheckCircle, ArrowLeft, Clock, Smartphone, Link as LinkIcon } from "lucide-react";

export default function PaymentProcessing() {
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
              <CreditCard className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">Manual Payment System for Bakers</h1>
            <p className="text-lg text-gray-600">
              Set up your payment links and manage customer payments your way—simple, flexible, and fee-free
            </p>
          </div>

          <div className="space-y-8">
            {/* How Payments Work */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LinkIcon className="h-5 w-5 mr-2 text-green-600" />
                  How Manual Payments Work
                </CardTitle>
                <CardDescription>Simple payment link setup with direct customer payments to your accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Payment Flow</h4>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-bold">1</span>
                        </div>
                        <span className="text-gray-700">Set up your preferred payment methods in dashboard</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-bold">2</span>
                        </div>
                        <span className="text-gray-700">Share payment links directly with customers</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-bold">3</span>
                        </div>
                        <span className="text-gray-700">Customers pay directly to your accounts</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-bold">4</span>
                        </div>
                        <span className="text-gray-700">Track payments manually in your dashboard</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Supported Payment Methods</h4>
                    <div className="space-y-3">
                      <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                        <h5 className="font-medium text-green-900 mb-2">Popular Methods</h5>
                        <ul className="text-sm text-green-800 space-y-1">
                          <li>• <strong>Zelle:</strong> Email or phone number</li>
                          <li>• <strong>PayPal:</strong> PayPal.me links</li>
                          <li>• <strong>CashApp:</strong> $Cashtag links</li>
                          <li>• <strong>Venmo:</strong> @username links</li>
                        </ul>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                        <h5 className="font-medium text-blue-900 mb-2">Custom Options</h5>
                        <p className="text-sm text-blue-800">
                          Add any payment service you prefer—from Apple Pay to cryptocurrency wallets.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Setting Up Payment Links */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Smartphone className="h-5 w-5 mr-2 text-green-600" />
                  Setting Up Your Payment Links
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Quick Setup Guide</h4>
                      <div className="space-y-3">
                        <div className="border border-gray-200 p-3 rounded">
                          <p className="font-medium text-gray-800">1. Access Payment Settings</p>
                          <p className="text-sm text-gray-600">Go to Dashboard → Payment Settings</p>
                          <p className="text-xs text-gray-500">Found in the main navigation menu</p>
                        </div>
                        <div className="border border-gray-200 p-3 rounded">
                          <p className="font-medium text-gray-800">2. Add Your Preferred Methods</p>
                          <p className="text-sm text-gray-600">Enter your Zelle email, PayPal link, etc.</p>
                          <p className="text-xs text-gray-500">You can add multiple payment options</p>
                        </div>
                        <div className="border border-gray-200 p-3 rounded">
                          <p className="font-medium text-gray-800">3. Share with Customers</p>
                          <p className="text-sm text-gray-600">You can include payment links in quotes and invoices</p>
                          <p className="text-xs text-gray-500">Customers choose their preferred method</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Payment Timeline Best Practices</h4>
                      <div className="space-y-3 text-sm text-gray-600">
                        <div className="border-l-4 border-pink-300 pl-4">
                          <p className="font-medium">Deposit Due</p>
                          <p>Within 24-48 hours of quote acceptance to secure the date</p>
                        </div>
                        <div className="border-l-4 border-blue-300 pl-4">
                          <p className="font-medium">Final Payment Due</p>
                          <p>3-7 days before event date (adjust based on your preference)</p>
                        </div>
                        <div className="border-l-4 border-green-300 pl-4">
                          <p className="font-medium">Rush Orders</p>
                          <p>100% payment required for orders with less than 1 week notice</p>
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded mt-4">
                        <p className="text-xs text-yellow-800">
                          <strong>Tip:</strong> Always confirm payment receipt and mark orders as paid in your dashboard.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* No Platform Fees */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  No Platform Transaction Fees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Keep 100% of Your Money</h4>
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-green-800">Platform Transaction Fees:</span>
                          <span className="font-medium text-green-900">$0.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-800">Platform Processing Fees:</span>
                          <span className="font-medium text-green-900">$0.00</span>
                        </div>
                        <div className="border-t border-green-300 pt-2 flex justify-between font-semibold">
                          <span className="text-green-900">You Keep:</span>
                          <span className="text-green-900">100% of payments</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded mt-3">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> Your payment services (Zelle, PayPal, etc.) may have their own fees. Check with each provider for details.
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Comparison Examples</h4>
                    <div className="space-y-3">
                      <div className="border border-gray-200 p-3 rounded">
                        <p className="font-medium text-gray-800">$200 Birthday Cake</p>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex justify-between">
                            <span>Order Total:</span>
                            <span>$200.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Platform Fees:</span>
                            <span className="text-green-600">$0.00</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>You Receive:</span>
                            <span className="text-green-700">$200.00</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border border-gray-200 p-3 rounded">
                        <p className="font-medium text-gray-800">$800 Wedding Cake</p>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex justify-between">
                            <span>Order Total:</span>
                            <span>$800.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Platform Fees:</span>
                            <span className="text-green-600">$0.00</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>You Receive:</span>
                            <span className="text-green-700">$800.00</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Managing Refunds */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-green-600" />
                  Handling Refunds & Cancellations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Refund Timeline Guidelines</h4>
                      <div className="space-y-3 text-sm text-gray-600">
                        <div className="bg-green-100 border border-green-300 p-3 rounded">
                          <p className="font-medium text-green-800">More than 2 weeks notice</p>
                          <p className="text-green-700">Full refund (you handle the refund process directly)</p>
                        </div>
                        <div className="bg-yellow-100 border border-yellow-300 p-3 rounded">
                          <p className="font-medium text-yellow-800">1-2 weeks notice</p>
                          <p className="text-yellow-700">50% refund to cover ingredient costs and preparation time</p>
                        </div>
                        <div className="bg-red-100 border border-red-300 p-3 rounded">
                          <p className="font-medium text-red-800">Less than 1 week notice</p>
                          <p className="text-red-700">No refund or minimal refund (10-25%) due to committed costs</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Manual Refund Process</h4>
                      <div className="space-y-3">
                        <div className="border border-gray-200 p-3 rounded">
                          <h5 className="font-medium text-gray-800">Direct Refunds</h5>
                          <p className="text-sm text-gray-600">
                            Since customers pay directly to your accounts, you handle refunds directly through 
                            your payment service (Zelle, PayPal, etc.) according to your cancellation policy.
                          </p>
                        </div>
                        <div className="border border-gray-200 p-3 rounded">
                          <h5 className="font-medium text-gray-800">Record Keeping</h5>
                          <p className="text-sm text-gray-600">
                            Update order status in your dashboard to "Refunded" and add notes about 
                            the refund amount and reason for your business records.
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-orange-50 border border-orange-200 p-3 rounded">
                        <p className="text-sm text-orange-800">
                          <strong>Important:</strong> Always document refunds in both your dashboard and 
                          payment service for accurate business records and tax reporting.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-600" />
                  Payment Link Security & Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Platform Security</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span>Secure storage of your payment link information</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span>SSL encryption for all data transmission</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span>Authenticated access to payment settings</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span>Payment links only shared with confirmed customers</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Your Responsibilities</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Use unique, secure passwords for payment accounts</li>
                        <li>• Keep payment service accounts up to date</li>
                        <li>• Verify customer identity before accepting payments</li>
                        <li>• Monitor your payment accounts regularly</li>
                        <li>• Report unauthorized transactions immediately</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Security Tips</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Enable two-factor authentication on payment accounts</li>
                        <li>• Document all customer communications</li>
                        <li>• Keep photos of completed work</li>
                        <li>• Confirm payment receipt before delivery</li>
                        <li>• Use separate business accounts when possible</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tax Considerations */}
            <Card>
              <CardHeader>
                <CardTitle>Tax Reporting & Record Keeping</CardTitle>
                <CardDescription>Managing taxes with manual payment systems</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">What You Need to Track</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>All payments received through your payment services</span>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Payment service fees and transaction costs</span>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Order details and customer information</span>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Business expenses and ingredient costs</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Your Tax Responsibilities</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Report all income from direct payments</span>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Collect and remit sales tax where required</span>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Keep detailed records of all transactions</span>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Maintain separate business accounts when possible</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mt-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Record Keeping Tips</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Use your dashboard to track order status and payment confirmations</li>
                    <li>• Save payment confirmations from your payment services</li>
                    <li>• Consider using accounting software to track income and expenses</li>
                    <li>• Keep receipts for all business-related expenses</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Disclaimer:</strong> Since payments go directly to your accounts, you're responsible for tracking 
                    and reporting all income. Tax laws vary by location—consult with a qualified tax professional for guidance.
                  </p>
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