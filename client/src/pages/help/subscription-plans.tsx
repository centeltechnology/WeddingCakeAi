import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CreditCard, Star, Crown, ArrowLeft, CheckCircle } from "lucide-react";

export default function SubscriptionPlans() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex flex-col">
      <NavigationHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/help">
              <Button variant="ghost" className="mb-4 hover:bg-pink-50" data-testid="button-back-to-help">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Help Center
              </Button>
            </Link>
          </div>

          <div className="text-center mb-8">
            <div className="bg-purple-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <CreditCard className="h-10 w-10 text-purple-600" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">Subscription Plans & Billing</h1>
            <p className="text-lg text-gray-600">Understanding our plans, billing, and how to manage your subscription</p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Available Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border border-gray-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                      Free Plan
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>Basic profile setup</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>Up to 5 quotes per month</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>Basic customer communication</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="border border-blue-300 p-4 rounded-lg bg-blue-50">
                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                      <Star className="h-4 w-4 text-blue-600 mr-2" />
                      Professional Plan
                    </h4>
                    <ul className="space-y-2 text-sm text-blue-700">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                        <span>Unlimited quotes</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                        <span>Advanced analytics</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                        <span>Custom subdomain</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="border border-purple-300 p-4 rounded-lg bg-purple-50">
                    <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                      <Crown className="h-4 w-4 text-purple-600 mr-2" />
                      Enterprise Plan
                    </h4>
                    <ul className="space-y-2 text-sm text-purple-700">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-purple-600 mr-2" />
                        <span>White-label branding</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-purple-600 mr-2" />
                        <span>Priority support</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-purple-600 mr-2" />
                        <span>Advanced integrations</span>
                      </li>
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