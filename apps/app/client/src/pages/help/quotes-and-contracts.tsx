import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Link } from "wouter";
import { FileText, Shield, AlertCircle, CheckCircle, CreditCard, Calendar, ArrowLeft } from "lucide-react";

export default function QuotesAndContracts() {
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
            <div className="bg-pink-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <FileText className="h-10 w-10 text-pink-600" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">Understanding Quotes & Contracts</h1>
            <p className="text-lg text-gray-600">
              Everything you need to know about the ordering process, quotes, and service agreements
            </p>
          </div>

          <div className="space-y-8">
            {/* Quote Process */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-pink-600 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold mr-3">1</span>
                  How Quotes Work
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  When you request a quote, here's what happens behind the scenes:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Quote Components</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Base cake pricing (size, tiers, flavors)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Decoration complexity and custom design work</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Special ingredients or dietary accommodations</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Delivery, setup, and service fees</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Timeline and rush order surcharges</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Quote Timeline</h4>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                        <span className="text-gray-600">Quote request submitted</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                        <span className="text-gray-600">Baker reviews (1-2 business days)</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-gray-600">Quote delivered to you</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-3 h-3 bg-pink-500 rounded-full mr-3"></div>
                        <span className="text-gray-600">You review and accept/negotiate</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contract Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-pink-600 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold mr-3">2</span>
                  Service Agreements & Contracts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">What's Included in Your Contract</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <h5 className="font-medium text-gray-800 mb-2">Service Details</h5>
                        <ul className="space-y-1">
                          <li>• Detailed cake description and specifications</li>
                          <li>• Event date, time, and delivery location</li>
                          <li>• Setup requirements and service level</li>
                          <li>• Number of servings and portion sizes</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-800 mb-2">Terms & Conditions</h5>
                        <ul className="space-y-1">
                          <li>• Payment schedule and accepted methods</li>
                          <li>• Cancellation and rescheduling policies</li>
                          <li>• Liability and insurance coverage</li>
                          <li>• Communication and change request process</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Your Protection</h4>
                      <p className="text-sm text-blue-800">
                        All contracts include buyer protection guarantees. If your baker fails to deliver as promised, 
                        BakerIQ will work to find a replacement or provide a full refund according to our service guarantee.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Terms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-pink-600 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold mr-3">3</span>
                  Payment & Deposits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Typical Payment Schedule
                    </h4>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="border-l-4 border-pink-300 pl-4">
                        <p className="font-medium">Deposit (25-50% of total)</p>
                        <p>Due when accepting the quote to secure your date</p>
                      </div>
                      <div className="border-l-4 border-blue-300 pl-4">
                        <p className="font-medium">Progress Payment (Optional)</p>
                        <p>For large orders, due 2-3 weeks before event</p>
                      </div>
                      <div className="border-l-4 border-green-300 pl-4">
                        <p className="font-medium">Final Payment</p>
                        <p>Due 1-7 days before delivery/pickup</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Important Dates
                    </h4>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                        <p className="font-medium text-yellow-800">Order Changes Deadline</p>
                        <p className="text-yellow-700">Usually 1-2 weeks before your event</p>
                      </div>
                      <div className="bg-red-50 border border-red-200 p-3 rounded">
                        <p className="font-medium text-red-800">Final Headcount Due</p>
                        <p className="text-red-700">Typically 1 week before event date</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 p-3 rounded">
                        <p className="font-medium text-green-800">Delivery Window</p>
                        <p className="text-green-700">Specified time range on event day</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Common Questions */}
            <Card>
              <CardHeader>
                <CardTitle>Common Questions About Quotes & Contracts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Can I negotiate the quote?</h4>
                    <p className="text-gray-600 text-sm">
                      Yes! Most bakers are open to discussion about pricing, especially if you're flexible on design complexity, 
                      flavors, or service level. Use the messaging system to discuss alternatives.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">What if I need to cancel?</h4>
                    <p className="text-gray-600 text-sm">
                      Cancellation terms vary by baker and are clearly outlined in your contract. Generally, more notice means 
                      better refund terms. Some deposits may be non-refundable to cover preparation costs.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Can I make changes after signing?</h4>
                    <p className="text-gray-600 text-sm">
                      Minor changes are usually possible with advance notice and may incur additional fees. Major changes 
                      might require a new quote. Always communicate changes through the platform messaging system.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">What payment methods are accepted?</h4>
                    <p className="text-gray-600 text-sm">
                      Most bakers accept credit cards, debit cards, and bank transfers through our secure payment system. 
                      Some may also accept cash for pickup orders. Payment methods are specified in your contract.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Warning Box */}
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-6 w-6 text-amber-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-2">Important Reminder</h3>
                  <p className="text-amber-800 text-sm">
                    Always read your contract carefully before signing. Pay special attention to cancellation policies, 
                    change request deadlines, and payment terms. If you have questions, don't hesitate to ask your baker 
                    or contact our support team for clarification.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}