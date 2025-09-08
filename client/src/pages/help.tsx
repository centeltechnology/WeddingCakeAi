import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Search, MessageSquare, FileText, CreditCard, Users, Settings, ChefHat, Calendar, TrendingUp } from "lucide-react";

export default function Help() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex flex-col">
      <NavigationHeader />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">Help Center</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find answers to common questions and get support for your Bakewise experience
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mt-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input 
                placeholder="Search for help articles..." 
                className="pl-12 py-4 text-lg border-pink-200 focus:border-pink-400"
                data-testid="input-help-search"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <MessageSquare className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                <CardTitle className="text-blue-900">Contact Support</CardTitle>
                <CardDescription>Get help from our team</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700" 
                  data-testid="button-contact-support"
                  onClick={() => window.location.href = 'mailto:support@bakewise.com?subject=Bakewise Support Request'}
                >
                  Send Message
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <FileText className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <CardTitle className="text-green-900">Documentation</CardTitle>
                <CardDescription>Detailed guides and tutorials</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  variant="outline" 
                  className="border-green-600 text-green-700 hover:bg-green-50" 
                  data-testid="button-view-docs"
                  onClick={() => {
                    const topicsSection = document.querySelector('[data-section="topics"]');
                    topicsSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  View Guides
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Settings className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                <CardTitle className="text-purple-900">Account Help</CardTitle>
                <CardDescription>Manage your account settings</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  variant="outline" 
                  className="border-purple-600 text-purple-700 hover:bg-purple-50" 
                  data-testid="button-account-help"
                  onClick={() => window.location.href = 'mailto:support@bakewise.com?subject=Account Help Request&body=Please describe your account issue:'}
                >
                  Get Help
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Common Topics */}
          <div className="mb-12" data-section="topics">
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8">Popular Topics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* For Bakers */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <ChefHat className="h-5 w-5 mr-2 text-pink-600" />
                  For Bakers
                </h3>
                <div className="space-y-3">
                  <Link href="/help/subdomain-setup">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800">Setting Up Your Subdomain</h4>
                        <p className="text-sm text-gray-600">Learn how to claim your professional bakewise.com subdomain</p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/help/quote-templates">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800">Creating Quote Templates</h4>
                        <p className="text-sm text-gray-600">Build reusable templates for faster quote generation</p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/help/customer-communications">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800">Managing Customer Communications</h4>
                        <p className="text-sm text-gray-600">Best practices for professional customer interactions</p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/help/payment-processing">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800">Payment Processing</h4>
                        <p className="text-sm text-gray-600">Understanding deposits, payments, and billing</p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/help/analytics-and-insights">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800">Analytics & Business Insights</h4>
                        <p className="text-sm text-gray-600">Understanding your dashboard metrics and growing your business</p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/help/marketing-your-bakery">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800">Marketing Your Bakery</h4>
                        <p className="text-sm text-gray-600">Strategies for attracting customers and building your brand</p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </div>

              {/* For Customers */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-pink-600" />
                  For Customers
                </h3>
                <div className="space-y-3">
                  <Link href="/help/custom-cake-ordering">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800">How to Order a Custom Cake</h4>
                        <p className="text-sm text-gray-600">Step-by-step guide to placing your first order</p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/help/quotes-and-contracts">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800">Understanding Quotes & Contracts</h4>
                        <p className="text-sm text-gray-600">What to expect in the ordering process</p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/help/dietary-restrictions">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800">Dietary Restrictions & Allergies</h4>
                        <p className="text-sm text-gray-600">How to communicate special dietary needs</p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/help/event-planning-tips">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800">Event Planning Tips</h4>
                        <p className="text-sm text-gray-600">Making your special occasion perfect</p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/help/payment-safety">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800">Payment Safety & Security</h4>
                        <p className="text-sm text-gray-600">How your payments and data are protected</p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/help/reviews-and-feedback">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800">Reviews & Feedback</h4>
                        <p className="text-sm text-gray-600">How to leave reviews and provide feedback</p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Help Topics */}
          <div className="mb-12">
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8">Additional Resources</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Platform Features */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-purple-600" />
                  Platform Features
                </h3>
                <div className="space-y-2">
                  <Link href="/help/account-setup">
                    <div className="text-sm text-gray-600 hover:text-pink-600 cursor-pointer p-2 hover:bg-pink-50 rounded">
                      Account Setup & Profile Management
                    </div>
                  </Link>
                  <Link href="/help/subscription-plans">
                    <div className="text-sm text-gray-600 hover:text-pink-600 cursor-pointer p-2 hover:bg-pink-50 rounded">
                      Subscription Plans & Billing
                    </div>
                  </Link>
                  <Link href="/help/mobile-app">
                    <div className="text-sm text-gray-600 hover:text-pink-600 cursor-pointer p-2 hover:bg-pink-50 rounded">
                      Mobile App Features
                    </div>
                  </Link>
                  <Link href="/help/notifications">
                    <div className="text-sm text-gray-600 hover:text-pink-600 cursor-pointer p-2 hover:bg-pink-50 rounded">
                      Notification Settings
                    </div>
                  </Link>
                </div>
              </div>
              
              {/* Business Growth */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Business Growth
                </h3>
                <div className="space-y-2">
                  <Link href="/help/seo-optimization">
                    <div className="text-sm text-gray-600 hover:text-pink-600 cursor-pointer p-2 hover:bg-pink-50 rounded">
                      SEO & Online Visibility
                    </div>
                  </Link>
                  <Link href="/help/social-media">
                    <div className="text-sm text-gray-600 hover:text-pink-600 cursor-pointer p-2 hover:bg-pink-50 rounded">
                      Social Media Integration
                    </div>
                  </Link>
                  <Link href="/help/customer-retention">
                    <div className="text-sm text-gray-600 hover:text-pink-600 cursor-pointer p-2 hover:bg-pink-50 rounded">
                      Customer Retention Strategies
                    </div>
                  </Link>
                  <Link href="/help/pricing-strategies">
                    <div className="text-sm text-gray-600 hover:text-pink-600 cursor-pointer p-2 hover:bg-pink-50 rounded">
                      Pricing & Profitability
                    </div>
                  </Link>
                </div>
              </div>
              
              {/* Technical Support */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                  Technical Support
                </h3>
                <div className="space-y-2">
                  <Link href="/help/troubleshooting">
                    <div className="text-sm text-gray-600 hover:text-pink-600 cursor-pointer p-2 hover:bg-pink-50 rounded">
                      Common Issues & Solutions
                    </div>
                  </Link>
                  <Link href="/help/browser-compatibility">
                    <div className="text-sm text-gray-600 hover:text-pink-600 cursor-pointer p-2 hover:bg-pink-50 rounded">
                      Browser & Device Compatibility
                    </div>
                  </Link>
                  <Link href="/help/data-privacy">
                    <div className="text-sm text-gray-600 hover:text-pink-600 cursor-pointer p-2 hover:bg-pink-50 rounded">
                      Privacy & Data Protection
                    </div>
                  </Link>
                  <Link href="/help/api-integration">
                    <div className="text-sm text-gray-600 hover:text-pink-600 cursor-pointer p-2 hover:bg-pink-50 rounded">
                      API & Third-party Integrations
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">How do I get started on Bakewise?</h3>
                <p className="text-gray-600">
                  Simply sign up for an account and choose whether you're a baker looking to grow your business or a customer seeking the perfect cake. Our onboarding process will guide you through setup.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Is my payment information secure?</h3>
                <p className="text-gray-600">
                  Yes! We use industry-standard encryption and work with trusted payment processors like Stripe to ensure your financial information is always protected.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Can I cancel or modify my order?</h3>
                <p className="text-gray-600">
                  Cancellation and modification policies vary by baker and are outlined in your contract. Generally, changes are possible with sufficient notice before your event date.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">How do I become a verified baker?</h3>
                <p className="text-gray-600">
                  Complete your baker profile with business information, certifications, and portfolio images. Our verification team reviews applications within 2-3 business days.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Still Need Help?</h2>
            <p className="text-gray-600 mb-6">
              Our support team is here to help you succeed on Bakewise
            </p>
            <div className="flex justify-center">
              <Button 
                size="lg" 
                className="bg-pink-600 hover:bg-pink-700" 
                data-testid="button-email-support"
                onClick={() => window.location.href = 'mailto:support@bakewise.com?subject=Support Request&body=Hi Bakewise Team,%0A%0APlease describe how we can help you:'}
              >
                Email Support
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}