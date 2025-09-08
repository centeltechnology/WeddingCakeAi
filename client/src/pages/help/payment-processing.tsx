import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CreditCard, Shield, DollarSign, TrendingUp, AlertCircle, CheckCircle, ArrowLeft, Clock } from "lucide-react";

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
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">Payment Processing for Bakers</h1>
            <p className="text-lg text-gray-600">
              Complete guide to managing deposits, payments, and billing through the Bakewise platform
            </p>
          </div>

          <div className="space-y-8">
            {/* How Payments Work */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-600" />
                  How Bakewise Payments Work
                </CardTitle>
                <CardDescription>Understanding the secure payment flow and your payout schedule</CardDescription>
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
                        <span className="text-gray-700">Customer pays through secure Stripe checkout</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-bold">2</span>
                        </div>
                        <span className="text-gray-700">Funds are securely held by Stripe (escrow)</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-bold">3</span>
                        </div>
                        <span className="text-gray-700">You receive automatic payout according to schedule</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-bold">4</span>
                        </div>
                        <span className="text-gray-700">Transaction fees are automatically deducted</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Payout Schedule</h4>
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <h5 className="font-medium text-green-900 mb-2">Standard Schedule</h5>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>• <strong>Weekly payouts:</strong> Every Friday for transactions from the previous week</li>
                        <li>• <strong>2-day processing:</strong> Deposits arrive in your bank account within 2 business days</li>
                        <li>• <strong>Holiday adjustments:</strong> Payouts may be delayed by bank holidays</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mt-3">
                      <h5 className="font-medium text-blue-900 mb-2">Express Payouts (Premium Feature)</h5>
                      <p className="text-sm text-blue-800">
                        Get access to same-day payouts for a small fee. Perfect for managing cash flow during busy periods.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Setting Up Deposits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                  Setting Up Deposits & Payment Terms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Recommended Deposit Structure</h4>
                      <div className="space-y-3">
                        <div className="border border-gray-200 p-3 rounded">
                          <p className="font-medium text-gray-800">Wedding Cakes</p>
                          <p className="text-sm text-gray-600">50% deposit, 50% final payment</p>
                          <p className="text-xs text-gray-500">High value orders warrant larger deposits</p>
                        </div>
                        <div className="border border-gray-200 p-3 rounded">
                          <p className="font-medium text-gray-800">Birthday/Celebration Cakes</p>
                          <p className="text-sm text-gray-600">25-40% deposit, remainder on delivery</p>
                          <p className="text-xs text-gray-500">Lower risk allows for smaller deposits</p>
                        </div>
                        <div className="border border-gray-200 p-3 rounded">
                          <p className="font-medium text-gray-800">Corporate Orders</p>
                          <p className="text-sm text-gray-600">30% deposit, NET 15 terms available</p>
                          <p className="text-xs text-gray-500">Business customers often prefer invoice terms</p>
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
                          <strong>Tip:</strong> Clear payment terms reduce last-minute stress and improve cash flow management.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Fees */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Understanding Fees & Pricing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Bakewise Platform Fees</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Transaction Processing:</span>
                          <span className="font-medium">2.9% + $0.30</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Platform Service Fee:</span>
                          <span className="font-medium">2.5%</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-semibold">
                          <span>Total per transaction:</span>
                          <span>5.4% + $0.30</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded mt-3">
                      <p className="text-sm text-blue-800">
                        <strong>Volume Discounts:</strong> Bakers processing over $10,000/month qualify for reduced platform fees.
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Fee Calculation Examples</h4>
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
                            <span>-$11.10</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>You Receive:</span>
                            <span>$188.90</span>
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
                            <span>-$43.50</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>You Receive:</span>
                            <span>$756.50</span>
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
                      <h4 className="font-semibold text-gray-800 mb-3">Refund Timeline</h4>
                      <div className="space-y-3 text-sm text-gray-600">
                        <div className="bg-green-100 border border-green-300 p-3 rounded">
                          <p className="font-medium text-green-800">More than 2 weeks notice</p>
                          <p className="text-green-700">Full refund minus processing fees (typically 5-10% retention)</p>
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
                      <h4 className="font-semibold text-gray-800 mb-3">Processing Refunds</h4>
                      <div className="space-y-3">
                        <div className="border border-gray-200 p-3 rounded">
                          <h5 className="font-medium text-gray-800">Partial Refunds</h5>
                          <p className="text-sm text-gray-600">
                            Use the dashboard to process partial refunds according to your cancellation policy. 
                            Funds are returned to the customer's original payment method.
                          </p>
                        </div>
                        <div className="border border-gray-200 p-3 rounded">
                          <h5 className="font-medium text-gray-800">Full Refunds</h5>
                          <p className="text-sm text-gray-600">
                            Complete refunds reverse all fees. Processing typically takes 3-5 business days 
                            to appear on the customer's statement.
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-orange-50 border border-orange-200 p-3 rounded">
                        <p className="text-sm text-orange-800">
                          <strong>Important:</strong> Always document the reason for refunds in the order notes 
                          for your records and tax purposes.
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
                  Payment Security & Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">What We Handle For You</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span>PCI DSS compliance for credit card processing</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span>SSL encryption for all payment data</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span>Fraud detection and prevention</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span>Chargeback protection and management</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span>Automated tax calculation and reporting</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Your Responsibilities</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Keep your banking information updated</li>
                        <li>• Respond to chargeback requests promptly</li>
                        <li>• Maintain accurate business tax information</li>
                        <li>• Report suspicious customer behavior</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Dispute Resolution</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Document all customer communications</li>
                        <li>• Provide delivery/pickup confirmation</li>
                        <li>• Keep photos of completed work</li>
                        <li>• Respond to disputes within 7 days</li>
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
                <CardDescription>Essential information for managing your bakery business taxes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">What Bakewise Provides</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Monthly payment summaries</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Annual 1099-K forms (for earnings over $600)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Transaction-level detail reports</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Fee breakdown for business expense deductions</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Your Tax Responsibilities</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Report all income received through the platform</span>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Collect and remit sales tax where required</span>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Maintain records of business expenses</span>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Consult with a tax professional for guidance</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Disclaimer:</strong> This information is for general guidance only. Tax laws vary by location 
                    and individual circumstances. Always consult with a qualified tax professional for advice specific to your situation.
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