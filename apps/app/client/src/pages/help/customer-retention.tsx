import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Link } from "wouter";
import { Heart, Users, Gift, ArrowLeft } from "lucide-react";

export default function CustomerRetention() {
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
              <Heart className="h-10 w-10 text-purple-600" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">Customer Retention Strategies</h1>
            <p className="text-lg text-gray-600">Build lasting relationships and encourage repeat business</p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-purple-600" />
                  Building Customer Loyalty
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Follow-up Strategies</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Send thank you messages after delivery</li>
                      <li>• Ask for feedback and reviews</li>
                      <li>• Check in after special events</li>
                      <li>• Share photos from the event</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Loyalty Programs</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Offer repeat customer discounts</li>
                      <li>• Create referral incentives</li>
                      <li>• Birthday cake reminders</li>
                      <li>• Holiday special offers</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="h-5 w-5 mr-2 text-pink-600" />
                  Retention Techniques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-pink-50 border border-pink-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-pink-900 mb-2">Personal Touch</h4>
                    <p className="text-sm text-pink-800">
                      Remember customer preferences, special occasions, and personal details to create meaningful connections.
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Proactive Communication</h4>
                    <p className="text-sm text-blue-800">
                      Reach out for upcoming holidays, anniversaries, and special occasions when customers might need cakes.
                    </p>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Exceed Expectations</h4>
                    <p className="text-sm text-green-800">
                      Surprise customers with small extras, early delivery, or complimentary add-ons to create memorable experiences.
                    </p>
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