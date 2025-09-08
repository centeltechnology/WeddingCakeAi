import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Calendar, Clock, MapPin, Users, Camera, Gift, ArrowLeft, Lightbulb, CheckCircle2 } from "lucide-react";

export default function EventPlanningTips() {
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
              <Calendar className="h-10 w-10 text-purple-600" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">Event Planning Tips</h1>
            <p className="text-lg text-gray-600">
              Expert advice for making your special occasion perfect, with your custom cake as the centerpiece
            </p>
          </div>

          <div className="space-y-8">
            {/* Timeline Planning */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-purple-600" />
                  Perfect Timing: When to Order Your Cake
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                      <span className="text-2xl font-bold text-red-600">6-12</span>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">Weeks Before</h4>
                    <p className="text-sm text-gray-600">
                      <strong>Weddings & Large Events:</strong> Book early for popular dates and complex designs. 
                      Peak season (spring/summer) requires even more lead time.
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-yellow-100 p-4 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                      <span className="text-2xl font-bold text-yellow-600">2-4</span>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">Weeks Before</h4>
                    <p className="text-sm text-gray-600">
                      <strong>Birthdays & Celebrations:</strong> Perfect timing for custom designs without rush fees. 
                      Allows time for tastings and adjustments.
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                      <span className="text-2xl font-bold text-green-600">1-2</span>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">Weeks Before</h4>
                    <p className="text-sm text-gray-600">
                      <strong>Last-Minute Events:</strong> Still possible with many bakers, but expect limited design 
                      options and potential rush fees.
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Pro Tip: Holiday & Peak Season Planning</h4>
                  <p className="text-sm text-blue-800">
                    Valentine's Day, Mother's Day, graduation season, and December holidays book up fast. 
                    Order 8-12 weeks in advance during these peak times.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Event Size & Cake Planning */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-purple-600" />
                  Sizing Your Cake Perfectly
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Serving Size Guidelines</h4>
                    <div className="space-y-3">
                      <div className="border border-gray-200 p-3 rounded">
                        <p className="font-medium text-gray-800">Wedding/Formal Events</p>
                        <p className="text-sm text-gray-600">Dessert-sized portions (2"×3" slices) - assumes other desserts available</p>
                      </div>
                      <div className="border border-gray-200 p-3 rounded">
                        <p className="font-medium text-gray-800">Birthday Parties</p>
                        <p className="text-sm text-gray-600">Regular portions (3"×4" slices) - cake is the main dessert</p>
                      </div>
                      <div className="border border-gray-200 p-3 rounded">
                        <p className="font-medium text-gray-800">Corporate Events</p>
                        <p className="text-sm text-gray-600">Smaller portions (2"×2" slices) - often served with coffee</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Order Extra Considerations</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span><strong>Photography needs:</strong> Order 5-10% extra if you want perfect slices for photos</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span><strong>Take-home portions:</strong> Consider guest preferences for leftovers</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span><strong>Unexpected guests:</strong> Add 5-10% buffer for last-minute additions</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span><strong>Vendor appreciation:</strong> Include staff and vendors in your count</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Venue Coordination */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-purple-600" />
                  Venue Coordination & Logistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Essential Venue Information to Share</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-800 mb-2">Delivery Access</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Loading dock or service entrance details</li>
                          <li>• Elevator size and access restrictions</li>
                          <li>• Parking arrangements for delivery vehicles</li>
                          <li>• Building access codes or security procedures</li>
                        </ul>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-800 mb-2">Setup Requirements</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Table size and stability for cake display</li>
                          <li>• Refrigeration availability if needed</li>
                          <li>• Room temperature and climate control</li>
                          <li>• Lighting conditions for cake presentation</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-amber-900 mb-2">Venue Coordinator Communication</h4>
                    <p className="text-sm text-amber-800">
                      Always introduce your baker to your venue coordinator. Share contact information and confirm 
                      delivery timing, setup requirements, and any venue-specific rules about outside vendors.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Design & Theme Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="h-5 w-5 mr-2 text-purple-600" />
                  Design & Theme Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Providing Design Inspiration</h4>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="border-l-4 border-pink-300 pl-4">
                        <p className="font-medium">Color Palette</p>
                        <p>Share your exact color scheme, including bridesmaid dress colors, decor swatches, or invitation colors</p>
                      </div>
                      <div className="border-l-4 border-blue-300 pl-4">
                        <p className="font-medium">Theme Elements</p>
                        <p>Photos of flowers, fabrics, venue decor, or inspiration images that capture your vision</p>
                      </div>
                      <div className="border-l-4 border-green-300 pl-4">
                        <p className="font-medium">Personal Touches</p>
                        <p>Meaningful symbols, hobbies, or shared interests that could be incorporated into the design</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Design Communication Tips</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Create a mood board or Pinterest collection to share your vision</span>
                      </li>
                      <li className="flex items-start">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Be specific about what you love in inspiration photos</span>
                      </li>
                      <li className="flex items-start">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Communicate your style: elegant, rustic, modern, whimsical, etc.</span>
                      </li>
                      <li className="flex items-start">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Discuss which design elements are "must-haves" vs. "nice to have"</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Day-of Coordination */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="h-5 w-5 mr-2 text-purple-600" />
                  Day-of Coordination & Photography
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Cake Cutting Ceremony</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><strong>Timing:</strong> Schedule 30-45 minutes after dinner service for optimal lighting and guest attention</p>
                        <p><strong>Setup:</strong> Ensure proper lighting and clear sightlines for photographers and guests</p>
                        <p><strong>Tools:</strong> Confirm who provides the cake cutting knife and server</p>
                        <p><strong>Coordination:</strong> Designate someone to cue the photographer and manage the moment</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Pre-Event Photography</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><strong>Detail shots:</strong> Photograph the cake before guests arrive for pristine images</p>
                        <p><strong>Lighting:</strong> Work with your photographer to ensure optimal cake lighting</p>
                        <p><strong>Angles:</strong> Capture multiple angles including close-ups of decorative details</p>
                        <p><strong>Context:</strong> Include shots of the cake in the overall venue decor</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Photography Coordination Tips</h4>
                    <p className="text-sm text-purple-800">
                      Share your cake delivery timeline with your photographer so they can plan detail shots. 
                      If you have an elaborate cake, consider having it delivered 2-3 hours early for photo opportunities 
                      before guests arrive.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget & Cost Management */}
            <Card>
              <CardHeader>
                <CardTitle>Budget & Cost Management</CardTitle>
                <CardDescription>Smart strategies for getting the most value from your cake investment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Cost-Saving Strategies</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start">
                        <span className="bg-green-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">$</span>
                        <span>Choose off-peak dates and seasons when possible</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-green-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">$</span>
                        <span>Opt for pickup instead of delivery if feasible</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-green-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">$</span>
                        <span>Consider simpler decorations with one stunning focal point</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-green-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">$</span>
                        <span>Mix high-end and standard flavors across different tiers</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">When to Invest More</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start">
                        <span className="bg-pink-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">★</span>
                        <span>Once-in-a-lifetime events (weddings, milestone anniversaries)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-pink-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">★</span>
                        <span>When the cake is a central element of your celebration</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-pink-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">★</span>
                        <span>Professional events where presentation matters</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-pink-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">★</span>
                        <span>Dietary accommodations that require specialized expertise</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Planning */}
            <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-4">Emergency Backup Planning</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-red-800">
                <div>
                  <h4 className="font-medium mb-2">Weather Contingencies</h4>
                  <ul className="space-y-1">
                    <li>• Plan indoor backup locations for outdoor events</li>
                    <li>• Discuss weather-related delivery adjustments</li>
                    <li>• Consider heat/humidity effects on decorations</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Timeline Flexibility</h4>
                  <ul className="space-y-1">
                    <li>• Build buffer time into your event schedule</li>
                    <li>• Have a contact person available for last-minute coordination</li>
                    <li>• Know your baker's emergency contact information</li>
                  </ul>
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