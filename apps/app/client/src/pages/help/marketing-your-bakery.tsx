import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Megaphone, Camera, Users, Star, Globe, Heart, ArrowLeft, Share2 } from "lucide-react";

export default function MarketingYourBakery() {
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
            <div className="bg-purple-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Megaphone className="h-10 w-10 text-purple-600" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">Marketing Your Bakery</h1>
            <p className="text-lg text-gray-600">
              Strategies for attracting customers, building your brand, and growing your bakery business
            </p>
          </div>

          <div className="space-y-8">
            {/* Building Your Brand */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-purple-600" />
                  Building Your Bakery Brand
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Brand Foundation</h4>
                    <div className="space-y-3">
                      <div className="border border-gray-200 p-3 rounded">
                        <p className="font-medium text-gray-800">Your Unique Story</p>
                        <p className="text-sm text-gray-600">What makes your bakery special? Family recipes, unique techniques, or personal journey</p>
                      </div>
                      <div className="border border-gray-200 p-3 rounded">
                        <p className="font-medium text-gray-800">Target Audience</p>
                        <p className="text-sm text-gray-600">Define your ideal customers: busy parents, wedding couples, corporate clients, etc.</p>
                      </div>
                      <div className="border border-gray-200 p-3 rounded">
                        <p className="font-medium text-gray-800">Brand Personality</p>
                        <p className="text-sm text-gray-600">Are you elegant and sophisticated, fun and playful, or artisan and authentic?</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Visual Identity</h4>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="bg-pink-50 border border-pink-200 p-3 rounded">
                        <p className="font-medium text-pink-800">Color Palette</p>
                        <p className="text-pink-700">Choose 2-3 colors that reflect your style and use consistently across all materials</p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                        <p className="font-medium text-blue-800">Photography Style</p>
                        <p className="text-blue-700">Develop a consistent look for your cake photos: lighting, backgrounds, angles</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 p-3 rounded">
                        <p className="font-medium text-green-800">Voice & Tone</p>
                        <p className="text-green-700">How you communicate: professional, friendly, warm, or sophisticated</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media Marketing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="h-5 w-5 mr-2 text-pink-600" />
                  Social Media Marketing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border border-gray-200 p-4 rounded-lg">
                      <div className="bg-pink-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <Camera className="h-6 w-6 text-pink-600" />
                      </div>
                      <h4 className="font-semibold text-gray-800 text-center mb-2">Instagram</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Best for:</strong> Visual showcase of your work</p>
                        <p><strong>Content:</strong> Finished cakes, behind-the-scenes, process videos</p>
                        <p><strong>Posting:</strong> 3-5 times per week</p>
                      </div>
                    </div>
                    
                    <div className="border border-gray-200 p-4 rounded-lg">
                      <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-800 text-center mb-2">Facebook</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Best for:</strong> Community building and events</p>
                        <p><strong>Content:</strong> Customer stories, seasonal promotions, live videos</p>
                        <p><strong>Posting:</strong> 2-3 times per week</p>
                      </div>
                    </div>
                    
                    <div className="border border-gray-200 p-4 rounded-lg">
                      <div className="bg-red-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <Share2 className="h-6 w-6 text-red-600" />
                      </div>
                      <h4 className="font-semibold text-gray-800 text-center mb-2">TikTok/Reels</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Best for:</strong> Reaching younger audiences</p>
                        <p><strong>Content:</strong> Quick decorating tips, trending audio with your cakes</p>
                        <p><strong>Posting:</strong> 3-4 times per week</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Content Ideas That Perform Well</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
                      <ul className="space-y-1">
                        <li>• Time-lapse decorating videos</li>
                        <li>• Before and after transformations</li>
                        <li>• Customer reaction videos</li>
                        <li>• Behind-the-scenes of your workspace</li>
                      </ul>
                      <ul className="space-y-1">
                        <li>• Ingredient spotlight posts</li>
                        <li>• Seasonal and holiday content</li>
                        <li>• Customer testimonials and reviews</li>
                        <li>• "Day in the life" content</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Photography Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="h-5 w-5 mr-2 text-blue-600" />
                  Cake Photography for Marketing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Equipment & Setup</h4>
                    <div className="space-y-3 text-sm">
                      <div className="border-l-4 border-blue-400 pl-4">
                        <p className="font-medium text-blue-800">Natural Lighting</p>
                        <p className="text-blue-700">Use window light or outdoor shade for the most flattering cake photos</p>
                      </div>
                      <div className="border-l-4 border-green-400 pl-4">
                        <p className="font-medium text-green-800">Simple Backgrounds</p>
                        <p className="text-green-700">White, marble, or wood surfaces let your cakes be the star</p>
                      </div>
                      <div className="border-l-4 border-purple-400 pl-4">
                        <p className="font-medium text-purple-800">Multiple Angles</p>
                        <p className="text-purple-700">Shoot front view, top-down, and detail shots of decorations</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Styling & Composition</h4>
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="font-medium text-gray-800 mb-2">Props to Consider</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• Fresh flowers or greenery</li>
                          <li>• Elegant cake stands or plates</li>
                          <li>• Matching linens or napkins</li>
                          <li>• Subtle seasonal elements</li>
                        </ul>
                      </div>
                      
                      <div className="bg-yellow-50 p-3 rounded">
                        <p className="font-medium text-yellow-800 mb-2">Pro Photography Tips</p>
                        <ul className="text-xs text-yellow-700 space-y-1">
                          <li>• Clean up any fingerprints or smudges</li>
                          <li>• Use a tripod for consistent shots</li>
                          <li>• Take photos immediately after completion</li>
                          <li>• Capture the scale with size references</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Reviews & Testimonials */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-600" />
                  Building Customer Reviews & Testimonials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Encouraging Reviews</h4>
                      <div className="space-y-3">
                        <div className="border border-gray-200 p-3 rounded">
                          <h5 className="font-medium text-gray-800">Perfect Timing</h5>
                          <p className="text-sm text-gray-600">Ask for reviews 1-2 days after the event when memories are fresh and positive</p>
                        </div>
                        <div className="border border-gray-200 p-3 rounded">
                          <h5 className="font-medium text-gray-800">Make it Easy</h5>
                          <p className="text-sm text-gray-600">Send direct links to your Google Business, Yelp, or Facebook review pages</p>
                        </div>
                        <div className="border border-gray-200 p-3 rounded">
                          <h5 className="font-medium text-gray-800">Incentivize</h5>
                          <p className="text-sm text-gray-600">Offer a small discount on future orders for customers who leave reviews</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Using Testimonials</h4>
                      <div className="space-y-3 text-sm">
                        <div className="bg-green-50 border border-green-200 p-3 rounded">
                          <p className="font-medium text-green-800">Website Integration</p>
                          <p className="text-green-700">Feature customer quotes prominently on your homepage and service pages</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                          <p className="font-medium text-blue-800">Social Media Posts</p>
                          <p className="text-blue-700">Share customer photos with their permission and quote their feedback</p>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 p-3 rounded">
                          <p className="font-medium text-purple-800">Marketing Materials</p>
                          <p className="text-purple-700">Include testimonials in brochures, business cards, and email signatures</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-2">Review Response Strategy</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-red-800">
                      <div>
                        <p className="font-medium mb-1">Positive Reviews:</p>
                        <ul className="space-y-1">
                          <li>• Thank the customer personally</li>
                          <li>• Mention specific details they praised</li>
                          <li>• Invite them to order again</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Negative Reviews:</p>
                        <ul className="space-y-1">
                          <li>• Respond quickly and professionally</li>
                          <li>• Acknowledge their concerns</li>
                          <li>• Offer to discuss privately</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Local Marketing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-green-600" />
                  Local Community Marketing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Community Partnerships</h4>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="border-l-4 border-green-400 pl-3">
                        <p className="font-medium">Wedding Venues</p>
                        <p>Partner with local venues for referrals and preferred vendor status</p>
                      </div>
                      <div className="border-l-4 border-blue-400 pl-3">
                        <p className="font-medium">Event Planners</p>
                        <p>Build relationships with planners who can recommend your services</p>
                      </div>
                      <div className="border-l-4 border-purple-400 pl-3">
                        <p className="font-medium">Local Businesses</p>
                        <p>Offer corporate catering to offices, restaurants, and retail stores</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Community Events</h4>
                    <div className="space-y-3">
                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                        <p className="font-medium text-yellow-800">Farmers Markets</p>
                        <p className="text-sm text-yellow-700">Sell cupcakes and mini cakes while showcasing your custom work with photos</p>
                      </div>
                      <div className="bg-pink-50 border border-pink-200 p-3 rounded">
                        <p className="font-medium text-pink-800">Bridal Shows</p>
                        <p className="text-sm text-pink-700">Display elaborate cake samples and collect contact information</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 p-3 rounded">
                        <p className="font-medium text-green-800">Charity Events</p>
                        <p className="text-sm text-green-700">Donate cakes for good causes while gaining exposure</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Referral Programs */}
            <Card>
              <CardHeader>
                <CardTitle>Word-of-Mouth & Referral Marketing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Customer Referral Program</h4>
                      <div className="space-y-2 text-sm">
                        <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                          <p className="font-medium text-blue-800">Reward Both Parties</p>
                          <p className="text-blue-700">Give the referrer and new customer each 10% off their next order</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 p-3 rounded">
                          <p className="font-medium text-green-800">Track Referrals</p>
                          <p className="text-green-700">Use referral codes or ask new customers how they heard about you</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Vendor Network</h4>
                      <div className="space-y-2 text-sm">
                        <div className="bg-purple-50 border border-purple-200 p-3 rounded">
                          <p className="font-medium text-purple-800">Cross-Promotion</p>
                          <p className="text-purple-700">Recommend photographers, florists, and venues who refer back to you</p>
                        </div>
                        <div className="bg-pink-50 border border-pink-200 p-3 rounded">
                          <p className="font-medium text-pink-800">Styled Shoots</p>
                          <p className="text-pink-700">Collaborate on photo shoots to create content for all vendors involved</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Building Lasting Relationships</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      The best marketing is exceptional service that naturally leads to word-of-mouth recommendations.
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Exceed expectations with surprise extras or early delivery</li>
                      <li>• Follow up after events to ensure everything went perfectly</li>
                      <li>• Remember personal details and special occasions</li>
                      <li>• Maintain professional relationships with all wedding vendors</li>
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