import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import SEOHead from "@/components/SEOHead";
import { Link } from "wouter";
import { Search, MessageSquare, FileText, CreditCard, Users, Settings, ChefHat, Calendar, TrendingUp, HelpCircle } from "lucide-react";

export default function Help() {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col">
      <SEOHead 
        title="Help Center - BakerIQ Support"
        description="Find answers to common questions, get support, and learn how to maximize your bakery business with BakerIQ platform features."
      />
      
      <NavigationHeader />
      
      <main className="flex-1 container mx-auto px-4 pt-20 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="h-10 w-10 text-orange-500" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6" data-testid="text-help-center">Help Center</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Find answers to common questions and get support for your BakerIQ experience
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mt-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input 
                placeholder="Search for help articles..." 
                className="pl-12 py-4 text-lg border-2 border-gray-200 dark:border-gray-700 focus:border-orange-500 h-14 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                data-testid="input-help-search"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-orange-200 hover:shadow-lg transition-all duration-300 p-6 bg-white dark:bg-gray-900">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-orange-500" />
                </div>
                <CardTitle className="text-gray-900 dark:text-white">Contact Support</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">Get help from our team</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  className="bg-orange-500 hover:bg-orange-600 text-white" 
                  data-testid="button-contact-support"
                  onClick={() => window.location.href = 'mailto:support@bakeriq.app?subject=BakerIQ Support Request'}
                >
                  Send Message
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-orange-200 hover:shadow-lg transition-all duration-300 p-6 bg-white dark:bg-gray-900">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-orange-500" />
                </div>
                <CardTitle className="text-gray-900 dark:text-white">Documentation</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">Detailed guides and tutorials</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  variant="outline" 
                  className="border-2 border-orange-500 text-orange-500 hover:bg-orange-50" 
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

            <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-orange-200 hover:shadow-lg transition-all duration-300 p-6 bg-white dark:bg-gray-900">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Settings className="h-8 w-8 text-orange-500" />
                </div>
                <CardTitle className="text-gray-900 dark:text-white">Account Help</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">Manage your account settings</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  variant="outline" 
                  className="border-2 border-orange-500 text-orange-500 hover:bg-orange-50" 
                  data-testid="button-account-help"
                  onClick={() => window.location.href = 'mailto:support@bakeriq.app?subject=Account Help Request&body=Please describe your account issue:'}
                >
                  Get Help
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Common Topics */}
          <div className="mb-16" data-section="topics">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center" data-testid="text-popular-topics">Popular Topics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* For Bakers */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                  <ChefHat className="h-6 w-6 mr-3 text-orange-500" />
                  For Bakers
                </h3>
                <div className="space-y-3">
                  <Link href="/help/subdomain-setup">
                    <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-orange-200 hover:shadow-md transition-all duration-300 cursor-pointer bg-white dark:bg-gray-900" data-testid="link-topic-subdomain-setup">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Setting Up Your Subdomain</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Learn how to claim your professional bakeriq.app subdomain</p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/help/quote-templates">
                    <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-orange-200 hover:shadow-md transition-all duration-300 cursor-pointer bg-white dark:bg-gray-900" data-testid="link-topic-quote-templates">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Creating Quote Templates</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Build reusable templates for faster quote generation</p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/help/customer-communications">
                    <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-orange-200 hover:shadow-md transition-all duration-300 cursor-pointer bg-white dark:bg-gray-900" data-testid="link-topic-customer-communications">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Managing Customer Communications</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Best practices for professional customer interactions</p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/help/payment-processing">
                    <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-orange-200 hover:shadow-md transition-all duration-300 cursor-pointer bg-white dark:bg-gray-900" data-testid="link-topic-payment-processing">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Payment Processing</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Understanding deposits, payments, and billing</p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/help/analytics-and-insights">
                    <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-orange-200 hover:shadow-md transition-all duration-300 cursor-pointer bg-white dark:bg-gray-900" data-testid="link-topic-analytics-and-insights">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Analytics & Business Insights</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Understanding your dashboard metrics and growing your business</p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/help/marketing-your-bakery">
                    <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-orange-200 hover:shadow-md transition-all duration-300 cursor-pointer bg-white dark:bg-gray-900" data-testid="link-topic-marketing-your-bakery">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Marketing Your Bakery</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Strategies for attracting customers and building your brand</p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </div>

              {/* For Customers */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                  <Users className="h-6 w-6 mr-3 text-orange-500" />
                  For Customers
                </h3>
                <div className="space-y-3">
                  <Link href="/help/custom-cake-ordering">
                    <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-orange-200 hover:shadow-md transition-all duration-300 cursor-pointer bg-white dark:bg-gray-900" data-testid="link-topic-custom-cake-ordering">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">How to Order a Custom Cake</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Step-by-step guide to placing your first order</p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/help/quotes-and-contracts">
                    <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-orange-200 hover:shadow-md transition-all duration-300 cursor-pointer bg-white dark:bg-gray-900" data-testid="link-topic-quotes-and-contracts">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Understanding Quotes & Contracts</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">What to expect in the ordering process</p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/help/dietary-restrictions">
                    <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-orange-200 hover:shadow-md transition-all duration-300 cursor-pointer bg-white dark:bg-gray-900" data-testid="link-topic-dietary-restrictions">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Dietary Restrictions & Allergies</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">How to communicate special dietary needs</p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/help/event-planning-tips">
                    <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-orange-200 hover:shadow-md transition-all duration-300 cursor-pointer bg-white dark:bg-gray-900" data-testid="link-topic-event-planning-tips">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Event Planning Tips</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Making your special occasion perfect</p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/help/payment-safety">
                    <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-orange-200 hover:shadow-md transition-all duration-300 cursor-pointer bg-white dark:bg-gray-900" data-testid="link-topic-payment-safety">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Payment Safety & Security</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">How your payments and data are protected</p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/help/reviews-and-feedback">
                    <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-orange-200 hover:shadow-md transition-all duration-300 cursor-pointer bg-white dark:bg-gray-900" data-testid="link-topic-reviews-and-feedback">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Reviews & Feedback</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">How to leave reviews and provide feedback</p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Help Topics */}
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">Additional Resources</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Platform Features */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-orange-500" />
                  Platform Features
                </h3>
                <div className="space-y-2">
                  <Link href="/help/account-setup">
                    <div className="text-sm text-gray-600 dark:text-gray-300 hover:text-orange-500 cursor-pointer p-2 hover:bg-orange-50 dark:hover:bg-gray-700 rounded">
                      Account Setup & Profile Management
                    </div>
                  </Link>
                  <Link href="/help/subscription-plans">
                    <div className="text-sm text-gray-600 dark:text-gray-300 hover:text-orange-500 cursor-pointer p-2 hover:bg-orange-50 dark:hover:bg-gray-700 rounded">
                      Subscription Plans & Billing
                    </div>
                  </Link>
                  <Link href="/help/mobile-app">
                    <div className="text-sm text-gray-600 dark:text-gray-300 hover:text-orange-500 cursor-pointer p-2 hover:bg-orange-50 dark:hover:bg-gray-700 rounded">
                      Mobile App Features
                    </div>
                  </Link>
                  <Link href="/help/notifications">
                    <div className="text-sm text-gray-600 dark:text-gray-300 hover:text-orange-500 cursor-pointer p-2 hover:bg-orange-50 dark:hover:bg-gray-700 rounded">
                      Notification Settings
                    </div>
                  </Link>
                </div>
              </div>
              
              {/* Business Growth */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-orange-500" />
                  Business Growth
                </h3>
                <div className="space-y-2">
                  <Link href="/help/seo-optimization">
                    <div className="text-sm text-gray-600 dark:text-gray-300 hover:text-orange-500 cursor-pointer p-2 hover:bg-orange-50 dark:hover:bg-gray-700 rounded">
                      SEO & Online Visibility
                    </div>
                  </Link>
                  <Link href="/help/social-media">
                    <div className="text-sm text-gray-600 dark:text-gray-300 hover:text-orange-500 cursor-pointer p-2 hover:bg-orange-50 dark:hover:bg-gray-700 rounded">
                      Social Media Integration
                    </div>
                  </Link>
                  <Link href="/help/customer-retention">
                    <div className="text-sm text-gray-600 dark:text-gray-300 hover:text-orange-500 cursor-pointer p-2 hover:bg-orange-50 dark:hover:bg-gray-700 rounded">
                      Customer Retention Strategies
                    </div>
                  </Link>
                  <Link href="/help/pricing-strategies">
                    <div className="text-sm text-gray-600 dark:text-gray-300 hover:text-orange-500 cursor-pointer p-2 hover:bg-orange-50 dark:hover:bg-gray-700 rounded">
                      Pricing & Profitability
                    </div>
                  </Link>
                </div>
              </div>
              
              {/* Technical Support */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-orange-500" />
                  Technical Support
                </h3>
                <div className="space-y-2">
                  <Link href="/help/troubleshooting">
                    <div className="text-sm text-gray-600 dark:text-gray-300 hover:text-orange-500 cursor-pointer p-2 hover:bg-orange-50 dark:hover:bg-gray-700 rounded">
                      Common Issues & Solutions
                    </div>
                  </Link>
                  <Link href="/help/browser-compatibility">
                    <div className="text-sm text-gray-600 dark:text-gray-300 hover:text-orange-500 cursor-pointer p-2 hover:bg-orange-50 dark:hover:bg-gray-700 rounded">
                      Browser & Device Compatibility
                    </div>
                  </Link>
                  <Link href="/help/data-privacy">
                    <div className="text-sm text-gray-600 dark:text-gray-300 hover:text-orange-500 cursor-pointer p-2 hover:bg-orange-50 dark:hover:bg-gray-700 rounded">
                      Privacy & Data Protection
                    </div>
                  </Link>
                  <Link href="/help/api-integration">
                    <div className="text-sm text-gray-600 dark:text-gray-300 hover:text-orange-500 cursor-pointer p-2 hover:bg-orange-50 dark:hover:bg-gray-700 rounded">
                      API & Third-party Integrations
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">How do I get started on BakerIQ?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Simply sign up for an account and choose whether you're a baker looking to grow your business or a customer seeking the perfect cake. Our onboarding process will guide you through setup.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Is my payment information secure?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes! We use industry-standard encryption and work with trusted payment processors like Stripe to ensure your financial information is always protected.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Can I cancel or modify my order?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Cancellation and modification policies vary by baker and are outlined in your contract. Generally, changes are possible with sufficient notice before your event date.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">How do I become a verified baker?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Complete your baker profile with business information, certifications, and portfolio images. Our verification team reviews applications within 2-3 business days.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-16 text-center">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Still Need Help?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Our support team is here to help you succeed on BakerIQ
            </p>
            <div className="flex justify-center">
              <Button 
                size="lg" 
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg" 
                data-testid="button-email-support"
                onClick={() => window.location.href = 'mailto:support@bakeriq.app?subject=Support Request&body=Hi BakerIQ Team,%0A%0APlease describe how we can help you:'}
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