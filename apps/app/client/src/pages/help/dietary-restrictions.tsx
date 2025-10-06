import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Utensils, AlertTriangle, CheckCircle, Heart, Wheat, Milk, ArrowLeft, Info } from "lucide-react";

export default function DietaryRestrictions() {
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
              <Utensils className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">Dietary Restrictions & Allergies</h1>
            <p className="text-lg text-gray-600">
              How to communicate special dietary needs and ensure safe, delicious cakes for everyone
            </p>
          </div>

          <div className="space-y-8">
            {/* Safety First */}
            <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">Safety First</h3>
                  <p className="text-red-800 text-sm">
                    <strong>Life-threatening allergies:</strong> If you or your guests have severe food allergies that could 
                    cause anaphylaxis, please communicate this clearly in your initial request and confirm that your chosen 
                    baker can safely accommodate these needs. When in doubt, consult with the baker directly about their 
                    kitchen practices and cross-contamination prevention.
                  </p>
                </div>
              </div>
            </div>

            {/* Common Dietary Needs */}
            <Card>
              <CardHeader>
                <CardTitle>Common Dietary Accommodations</CardTitle>
                <CardDescription>Most bakers can accommodate these dietary needs with advance notice</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="border border-gray-200 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Wheat className="h-5 w-5 text-amber-600 mr-2" />
                        <h4 className="font-semibold text-gray-800">Gluten-Free</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Available through most bakers using alternative flours like almond, rice, or certified gluten-free blends.
                      </p>
                      <div className="bg-amber-50 p-2 rounded text-xs text-amber-800">
                        <strong>Note:</strong> Ask about cross-contamination prevention in shared kitchens
                      </div>
                    </div>

                    <div className="border border-gray-200 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Milk className="h-5 w-5 text-blue-600 mr-2" />
                        <h4 className="font-semibold text-gray-800">Dairy-Free/Vegan</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Many bakers offer plant-based alternatives using coconut oil, vegan butter, and non-dairy milks.
                      </p>
                      <div className="bg-blue-50 p-2 rounded text-xs text-blue-800">
                        <strong>Tip:</strong> Vegan cakes can be just as delicious and moist as traditional recipes
                      </div>
                    </div>

                    <div className="border border-gray-200 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Heart className="h-5 w-5 text-red-600 mr-2" />
                        <h4 className="font-semibold text-gray-800">Sugar-Free/Diabetic</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Options include natural sweeteners like stevia, monk fruit, or sugar alcohols.
                      </p>
                      <div className="bg-red-50 p-2 rounded text-xs text-red-800">
                        <strong>Important:</strong> Discuss blood sugar impact with your baker and healthcare provider
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-3">Other Common Restrictions</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          <span>Nut-free (tree nuts and peanuts)</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          <span>Egg-free (often overlaps with vegan)</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          <span>Soy-free</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          <span>Keto/Low-carb</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          <span>Kosher or Halal requirements</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          <span>Specific food colorings or additives</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Pricing Considerations</h4>
                      <p className="text-sm text-yellow-700">
                        Specialty ingredients often cost more than standard ones. Expect a 10-30% premium for dietary 
                        accommodations, depending on complexity and ingredients required.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How to Communicate */}
            <Card>
              <CardHeader>
                <CardTitle>How to Communicate Your Needs</CardTitle>
                <CardDescription>Best practices for ensuring your dietary requirements are understood and met</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">In Your Initial Request</h4>
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <p className="text-sm text-green-800 mb-3">
                        <strong>Be specific and clear from the start:</strong>
                      </p>
                      <ul className="space-y-1 text-sm text-green-700">
                        <li>• State the exact dietary restriction (e.g., "severe nut allergy" vs. "prefers to avoid nuts")</li>
                        <li>• Mention how many guests have this restriction</li>
                        <li>• Specify if you need the entire cake to accommodate the restriction or just a portion</li>
                        <li>• Include any acceptable alternative ingredients you know work well</li>
                        <li>• Mention if you have past experience with bakers who successfully accommodated your needs</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Questions to Ask Your Baker</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3 text-sm text-gray-600">
                        <div>
                          <p className="font-medium text-gray-800">Experience & Safety</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>How often do you make [specific dietary accommodation] cakes?</li>
                            <li>What measures do you take to prevent cross-contamination?</li>
                            <li>Do you have separate equipment/workspace for allergen-free baking?</li>
                          </ul>
                        </div>
                      </div>
                      <div className="space-y-3 text-sm text-gray-600">
                        <div>
                          <p className="font-medium text-gray-800">Ingredients & Quality</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>What specific ingredients/brands do you use?</li>
                            <li>Can you provide ingredient lists for review?</li>
                            <li>How does taste/texture compare to traditional versions?</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testing & Tastings */}
            <Card>
              <CardHeader>
                <CardTitle>Testing & Tastings</CardTitle>
                <CardDescription>Ensuring you love the result before your special day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Tasting Sessions</h4>
                    <p className="text-gray-600 text-sm mb-3">
                      Many bakers offer mini versions of specialty cakes for tasting, especially for dietary accommodations 
                      where taste and texture questions are common.
                    </p>
                    <div className="bg-blue-50 p-3 rounded text-sm text-blue-800">
                      <strong>Recommended:</strong> Always request a tasting for dietary accommodations, even if there's a small fee. 
                      It's better to know in advance if adjustments are needed.
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Sample Questions for Tasting</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Is this the exact recipe you'll use for our cake?</li>
                      <li>• How will the full-size cake differ from this sample?</li>
                      <li>• Can we adjust sweetness/flavor intensity?</li>
                      <li>• How will decorations adhere to specialty cake bases?</li>
                      <li>• Will the cake hold up for our event timeline?</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mixed Dietary Needs */}
            <Card>
              <CardHeader>
                <CardTitle>Multiple Dietary Needs & Mixed Groups</CardTitle>
                <CardDescription>Solutions when your guest list has varied dietary requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Option 1: One Cake That Works for Everyone</h4>
                    <p className="text-sm text-purple-800 mb-2">
                      Choose accommodations that overlap (e.g., vegan cake is automatically dairy-free and often egg-free).
                    </p>
                    <p className="text-xs text-purple-700">
                      <strong>Best for:</strong> Small gatherings or when most guests share the same restrictions
                    </p>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-2">Option 2: Multiple Cake Layers/Tiers</h4>
                    <p className="text-sm text-orange-800 mb-2">
                      Different tiers with different dietary accommodations. For example: bottom tier gluten-free, top tier traditional.
                    </p>
                    <p className="text-xs text-orange-700">
                      <strong>Best for:</strong> Medium to large events with clearly defined dietary groups
                    </p>
                  </div>

                  <div className="bg-teal-50 border border-teal-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-teal-900 mb-2">Option 3: Separate Desserts</h4>
                    <p className="text-sm text-teal-800 mb-2">
                      Main celebration cake plus smaller specialty desserts (cupcakes, mini cakes) for those with restrictions.
                    </p>
                    <p className="text-xs text-teal-700">
                      <strong>Best for:</strong> Large events or when you want a specific traditional cake design
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Planning */}
            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
              <div className="flex items-start">
                <Info className="h-6 w-6 text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-2">Emergency Preparedness</h3>
                  <div className="text-yellow-800 text-sm space-y-2">
                    <p>
                      <strong>For severe allergies:</strong> Always have an emergency action plan and ensure key event 
                      organizers know about dietary restrictions.
                    </p>
                    <p>
                      <strong>Backup plan:</strong> Consider having emergency-safe desserts available, especially for 
                      children's events where accidental exposure is more likely.
                    </p>
                    <p>
                      <strong>Communication:</strong> Inform your venue and caterer about severe allergies so they can 
                      take additional precautions during service.
                    </p>
                  </div>
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