import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle, Heart, ShoppingCart, Calendar, CreditCard, FileText } from "lucide-react";

export default function CustomCakeOrdering() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex flex-col">
      <NavigationHeader />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link href="/help">
            <Button variant="ghost" className="mb-6" data-testid="button-back-to-help">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Help Center
            </Button>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">How to Order a Custom Cake</h1>
            <p className="text-xl text-gray-600">
              Step-by-step guide to ordering your perfect custom cake through BakerIQ
            </p>
          </div>

          {/* Quick Overview */}
          <Card className="mb-8 bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
            <CardHeader>
              <CardTitle className="flex items-center text-pink-900">
                <Heart className="h-6 w-6 mr-2" />
                What Makes Ordering Special
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-pink-800">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-pink-600" />
                  Connect directly with verified local bakers
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-pink-600" />
                  Get instant quotes with transparent pricing
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-pink-600" />
                  Secure payments and digital contracts
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-pink-600" />
                  Track your order from quote to delivery
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Step-by-Step Process */}
          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-gray-900">Ordering Process</h2>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-pink-600 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold mr-3">1</span>
                  Find Your Perfect Baker
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Browse our verified bakers and find the perfect match for your event.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">How to Search:</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                    <li>Use location filters to find bakers near you</li>
                    <li>Filter by specialties (wedding cakes, custom designs, etc.)</li>
                    <li>Review portfolios and customer ratings</li>
                    <li>Check pricing ranges and availability</li>
                  </ul>
                </div>
                <p className="text-sm text-gray-600">
                  <strong>Tip:</strong> Look for bakers with the "Verified" badge and read recent customer reviews for the best experience.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-pink-600 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold mr-3">2</span>
                  Describe Your Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Use our guided form to describe exactly what you want.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Basic Information</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Event type and date</li>
                      <li>• Number of guests to serve</li>
                      <li>• Delivery or pickup preference</li>
                      <li>• Budget range (optional)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Design Details</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Cake size and shape</li>
                      <li>• Flavor preferences</li>
                      <li>• Color scheme and theme</li>
                      <li>• Special decorations or toppers</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg mt-4">
                  <p className="text-sm text-blue-800">
                    <strong>Pro Tip:</strong> Upload inspiration photos! Visual references help bakers understand your vision and provide more accurate quotes.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-pink-600 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold mr-3">3</span>
                  Review Your Quote
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Receive a detailed, itemized quote usually within 24 hours.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-sm">Detailed pricing breakdown</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-sm">Timeline and delivery details</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-sm">Terms and conditions</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-sm">Digital contract for signing</span>
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg mt-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Questions about your quote?</strong> Use the built-in messaging system to discuss any changes or clarifications with your baker.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-pink-600 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold mr-3">4</span>
                  Secure Your Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Sign your contract and pay securely through our platform.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Digital Contract
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Review all terms carefully</li>
                      <li>• Electronically sign with date/time stamp</li>
                      <li>• Receive instant confirmation</li>
                      <li>• Copy stored in your account</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Secure Payment
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Pay deposit to secure your date</li>
                      <li>• Remaining balance due closer to event</li>
                      <li>• All payments protected by Stripe</li>
                      <li>• Automatic payment reminders</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-pink-600 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold mr-3">5</span>
                  Track Your Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Stay updated on your cake's progress from creation to delivery.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-800">Order Confirmed</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-800">In Production</span>
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-800">Ready for Delivery</span>
                    <ShoppingCart className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Important Tips */}
          <Card className="mt-8 bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900">Important Tips for Success</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-green-900">Order Early</h4>
                  <p className="text-green-800 text-sm">Popular bakers book up quickly, especially during wedding season. Order 4-6 weeks in advance for custom designs.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-green-900">Be Specific About Allergies</h4>
                  <p className="text-green-800 text-sm">Always mention food allergies and dietary restrictions upfront. This ensures your baker can accommodate safely.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-green-900">Communicate Openly</h4>
                  <p className="text-green-800 text-sm">Use our messaging system to ask questions and provide updates. Good communication leads to better results!</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Questions about ordering? We're here to help!</p>
            <Button 
              className="bg-pink-600 hover:bg-pink-700"
              onClick={() => window.location.href = 'mailto:support@bakeriq.app?subject=Custom Cake Ordering Help'}
              data-testid="button-contact-ordering-support"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}