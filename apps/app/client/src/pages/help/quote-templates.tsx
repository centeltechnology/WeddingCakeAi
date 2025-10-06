import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle, Clock, DollarSign, FileText } from "lucide-react";

export default function QuoteTemplates() {
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
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">Creating Quote Templates</h1>
            <p className="text-xl text-gray-600">
              Build reusable templates to speed up your quote generation and maintain consistency
            </p>
          </div>

          {/* Benefits Card */}
          <Card className="mb-8 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center text-green-900">
                <Clock className="h-6 w-6 mr-2" />
                Benefits of Quote Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-green-800">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Save 80% of time on quote creation
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Ensure consistent pricing across orders
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Reduce pricing errors and omissions
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Professional, branded quote appearance
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Template Types */}
          <div className="mb-8">
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Types of Templates to Create</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-pink-900">Wedding Cakes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3">Create templates for different wedding cake tiers and styles:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 2-tier, 3-tier, and 4-tier options</li>
                    <li>• Different flavor combinations</li>
                    <li>• Decoration complexity levels</li>
                    <li>• Delivery and setup services</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-pink-900">Birthday Cakes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3">Standard birthday cake offerings:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Round cakes in various sizes</li>
                    <li>• Sheet cakes for large parties</li>
                    <li>• Custom character themes</li>
                    <li>• Add-on decorations</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-pink-900">Corporate Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3">Professional event catering:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Logo cakes and branded designs</li>
                    <li>• Cupcake towers and displays</li>
                    <li>• Dessert table packages</li>
                    <li>• Bulk ordering discounts</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-pink-900">Specialty Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3">Unique offerings and seasonal items:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Holiday-themed cakes</li>
                    <li>• Gluten-free and vegan options</li>
                    <li>• Sculpted and 3D cakes</li>
                    <li>• Cookies and dessert platters</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Creating Templates */}
          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-gray-900">How to Create Templates</h2>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-pink-600 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold mr-3">1</span>
                  Start with Your Most Common Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Review your past orders to identify patterns and frequently requested items.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Pro Tip:</strong> Start with your top 3-5 most popular cake types to get the biggest time savings immediately.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-pink-600 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold mr-3">2</span>
                  Set Up Base Pricing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Establish your core pricing structure for each template.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Base cake price by size and flavor</li>
                  <li>Decoration complexity pricing tiers</li>
                  <li>Add-on options and upgrades</li>
                  <li>Delivery and setup fees</li>
                  <li>Rush order premiums</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-pink-600 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold mr-3">3</span>
                  Add Template Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Include all the information customers need to understand your offering.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Template Information</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Template name and description</li>
                      <li>• Serving size recommendations</li>
                      <li>• Available flavors and fillings</li>
                      <li>• Design examples and photos</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Terms & Conditions</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Lead time requirements</li>
                      <li>• Deposit and payment terms</li>
                      <li>• Cancellation policies</li>
                      <li>• Allergen information</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-pink-600 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold mr-3">4</span>
                  Test and Refine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Use your templates with real customers and improve based on feedback.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Send test quotes to yourself to check formatting</li>
                  <li>Get feedback from customers on clarity</li>
                  <li>Track which templates convert best</li>
                  <li>Regular update pricing and options</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Best Practices */}
          <Card className="mt-8 bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-900">
                <DollarSign className="h-6 w-6 mr-2" />
                Pricing Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-purple-900">Build in Your Profit Margins</h4>
                  <p className="text-purple-800 text-sm">Include all costs: ingredients, labor, overhead, and your desired profit margin.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-900">Offer Package Deals</h4>
                  <p className="text-purple-800 text-sm">Bundle related items like matching cupcakes or cookie favors to increase order value.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-900">Regular Price Reviews</h4>
                  <p className="text-purple-800 text-sm">Update templates quarterly to reflect ingredient cost changes and market rates.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Need help setting up your quote templates?</p>
            <Button 
              className="bg-pink-600 hover:bg-pink-700"
              onClick={() => window.location.href = 'mailto:support@bakeriq.app?subject=Quote Template Help'}
              data-testid="button-contact-template-support"
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