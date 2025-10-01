import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Star, MessageSquare, ThumbsUp, Heart, Edit, ArrowLeft, Flag } from "lucide-react";

export default function ReviewsAndFeedback() {
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
            <div className="bg-yellow-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Star className="h-10 w-10 text-yellow-600" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">Reviews & Feedback</h1>
            <p className="text-lg text-gray-600">
              How to leave reviews, provide feedback, and help build a trusted community of bakers
            </p>
          </div>

          <div className="space-y-8">
            {/* How to Leave Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-600" />
                  How to Leave a Review
                </CardTitle>
                <CardDescription>Step-by-step guide to sharing your experience with other customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Review Process</h4>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-bold">1</span>
                        </div>
                        <span className="text-gray-700">Complete your order and receive your cake</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-bold">2</span>
                        </div>
                        <span className="text-gray-700">Check your email for a review invitation (sent 24-48 hours after delivery)</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-bold">3</span>
                        </div>
                        <span className="text-gray-700">Click the review link or visit the baker's profile</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-bold">4</span>
                        </div>
                        <span className="text-gray-700">Rate your experience and share your detailed feedback</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">When to Review</h4>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="bg-green-50 border border-green-200 p-3 rounded">
                        <p className="font-medium text-green-800">Best Time</p>
                        <p className="text-green-700">1-3 days after your event when the experience is fresh in your memory</p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                        <p className="font-medium text-blue-800">Give it Time</p>
                        <p className="text-blue-700">Allow the event to happen so you can review the full experience</p>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 p-3 rounded">
                        <p className="font-medium text-purple-800">Be Fair</p>
                        <p className="text-purple-700">Consider the entire process from initial contact to final delivery</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What Makes a Great Review */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Edit className="h-5 w-5 mr-2 text-blue-600" />
                  Writing Helpful Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">What to Include</h4>
                      <div className="space-y-3">
                        <div className="border border-gray-200 p-3 rounded">
                          <h5 className="font-medium text-gray-800">Communication & Service</h5>
                          <p className="text-sm text-gray-600">How responsive was the baker? Did they answer questions clearly?</p>
                        </div>
                        <div className="border border-gray-200 p-3 rounded">
                          <h5 className="font-medium text-gray-800">Quality & Taste</h5>
                          <p className="text-sm text-gray-600">How did the cake look and taste? Did it meet your expectations?</p>
                        </div>
                        <div className="border border-gray-200 p-3 rounded">
                          <h5 className="font-medium text-gray-800">Delivery & Presentation</h5>
                          <p className="text-sm text-gray-600">Was delivery on time? How was the cake packaged and presented?</p>
                        </div>
                        <div className="border border-gray-200 p-3 rounded">
                          <h5 className="font-medium text-gray-800">Overall Experience</h5>
                          <p className="text-sm text-gray-600">Would you order again? Any standout moments?</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Review Examples</h4>
                      <div className="space-y-3">
                        <div className="bg-green-50 border border-green-200 p-3 rounded text-sm">
                          <p className="font-medium text-green-800">5-Star Example</p>
                          <p className="text-green-700 italic">
                            "Amazing experience from start to finish! Sarah was incredibly responsive and helped me design the perfect wedding cake. The flavors were exceptional and it looked even better than the photos. Guests are still raving about it weeks later!"
                          </p>
                        </div>
                        
                        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm">
                          <p className="font-medium text-yellow-800">Constructive 3-Star Example</p>
                          <p className="text-yellow-700 italic">
                            "The cake tasted great and looked beautiful, but communication was slow and delivery was 30 minutes late. Would have been perfect with better timing. The baker was apologetic and offered a discount for future orders."
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded mt-3">
                        <p className="text-sm text-gray-600">
                          <strong>Tip:</strong> Specific details help other customers and give bakers valuable feedback for improvement.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Rating Guidelines</h4>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm text-blue-800">
                      <div className="text-center">
                        <div className="flex justify-center mb-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        </div>
                        <p className="font-medium">1 Star</p>
                        <p className="text-xs">Poor experience, major issues</p>
                      </div>
                      <div className="text-center">
                        <div className="flex justify-center mb-1">
                          {[1,2].map(i => <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />)}
                        </div>
                        <p className="font-medium">2 Stars</p>
                        <p className="text-xs">Below expectations, multiple problems</p>
                      </div>
                      <div className="text-center">
                        <div className="flex justify-center mb-1">
                          {[1,2,3].map(i => <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />)}
                        </div>
                        <p className="font-medium">3 Stars</p>
                        <p className="text-xs">Good but room for improvement</p>
                      </div>
                      <div className="text-center">
                        <div className="flex justify-center mb-1">
                          {[1,2,3,4].map(i => <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />)}
                        </div>
                        <p className="font-medium">4 Stars</p>
                        <p className="text-xs">Very good, minor issues</p>
                      </div>
                      <div className="text-center">
                        <div className="flex justify-center mb-1">
                          {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />)}
                        </div>
                        <p className="font-medium">5 Stars</p>
                        <p className="text-xs">Excellent, exceeded expectations</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Photo Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ThumbsUp className="h-5 w-5 mr-2 text-green-600" />
                  Adding Photos to Your Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Why Photos Matter</h4>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="border-l-4 border-green-400 pl-4">
                        <p className="font-medium text-green-800">Help Other Customers</p>
                        <p className="text-green-700">Show real examples of the baker's work in different settings</p>
                      </div>
                      <div className="border-l-4 border-blue-400 pl-4">
                        <p className="font-medium text-blue-800">Support the Baker</p>
                        <p className="text-blue-700">Great photos showcase their skills and attract new customers</p>
                      </div>
                      <div className="border-l-4 border-purple-400 pl-4">
                        <p className="font-medium text-purple-800">Add Credibility</p>
                        <p className="text-purple-700">Visual proof makes your review more trustworthy and helpful</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Photo Tips</h4>
                    <div className="space-y-3">
                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm">
                        <p className="font-medium text-yellow-800">What to Photograph</p>
                        <ul className="text-yellow-700 space-y-1 mt-1">
                          <li>• The complete cake from multiple angles</li>
                          <li>• Close-ups of detailed decorations</li>
                          <li>• The cake in its final setting (at the event)</li>
                          <li>• Cross-section showing layers and filling</li>
                        </ul>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 p-3 rounded text-sm">
                        <p className="font-medium text-blue-800">Photography Guidelines</p>
                        <ul className="text-blue-700 space-y-1 mt-1">
                          <li>• Use natural lighting when possible</li>
                          <li>• Ensure photos are clear and well-focused</li>
                          <li>• Show the cake's true colors</li>
                          <li>• Include some context (table setting, venue)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Responding to Baker Feedback */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-purple-600" />
                  Baker Responses & Follow-up
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">When Bakers Respond</h4>
                      <div className="space-y-3 text-sm text-gray-600">
                        <div className="bg-green-50 border border-green-200 p-3 rounded">
                          <p className="font-medium text-green-800">Thank You Messages</p>
                          <p className="text-green-700">Bakers often respond to positive reviews with gratitude and appreciation</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                          <p className="font-medium text-blue-800">Addressing Concerns</p>
                          <p className="text-blue-700">Professional bakers respond to concerns with explanations and solutions</p>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 p-3 rounded">
                          <p className="font-medium text-purple-800">Future Improvements</p>
                          <p className="text-purple-700">Many bakers share how they're using feedback to improve their service</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Updating Your Review</h4>
                      <div className="space-y-3">
                        <div className="border border-gray-200 p-3 rounded">
                          <h5 className="font-medium text-gray-800">When to Update</h5>
                          <p className="text-sm text-gray-600">If the baker addresses your concerns or provides additional value after your initial review</p>
                        </div>
                        <div className="border border-gray-200 p-3 rounded">
                          <h5 className="font-medium text-gray-800">How to Update</h5>
                          <p className="text-sm text-gray-600">Edit your original review or add a follow-up comment explaining the resolution</p>
                        </div>
                      </div>
                      
                      <div className="bg-orange-50 border border-orange-200 p-3 rounded mt-3">
                        <p className="text-sm text-orange-800">
                          <strong>Fair Practice:</strong> If a baker goes above and beyond to fix an issue, consider updating your rating to reflect the complete experience.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Platform Feedback */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-600" />
                  Providing Platform Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">How to Share Feedback</h4>
                      <div className="space-y-3">
                        <div className="border border-gray-200 p-3 rounded">
                          <h5 className="font-medium text-gray-800">Feature Requests</h5>
                          <p className="text-sm text-gray-600">Suggest new features or improvements through our feedback form</p>
                        </div>
                        <div className="border border-gray-200 p-3 rounded">
                          <h5 className="font-medium text-gray-800">Bug Reports</h5>
                          <p className="text-sm text-gray-600">Report technical issues to help us improve the platform</p>
                        </div>
                        <div className="border border-gray-200 p-3 rounded">
                          <h5 className="font-medium text-gray-800">User Experience</h5>
                          <p className="text-sm text-gray-600">Share your overall experience using BakerIQ</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">What We Do With Feedback</h4>
                      <div className="space-y-3 text-sm text-gray-600">
                        <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                          <p className="font-medium text-blue-800">Product Development</p>
                          <p className="text-blue-700">User feedback directly influences our roadmap and new features</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 p-3 rounded">
                          <p className="font-medium text-green-800">Quality Improvements</p>
                          <p className="text-green-700">We use feedback to identify and fix issues quickly</p>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 p-3 rounded">
                          <p className="font-medium text-purple-800">Community Building</p>
                          <p className="text-purple-700">Feedback helps us create a better experience for everyone</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Quick Feedback Channels</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
                      <div>
                        <p className="font-medium">Email Support</p>
                        <p>support@bakeriq.app</p>
                      </div>
                      <div>
                        <p className="font-medium">In-App Feedback</p>
                        <p>Feedback button in your account</p>
                      </div>
                      <div>
                        <p className="font-medium">Social Media</p>
                        <p>Message us on social platforms</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reporting Issues */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Flag className="h-5 w-5 mr-2 text-red-600" />
                  Reporting Problems
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">When to Report</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start">
                          <Flag className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Inappropriate or false reviews</span>
                        </li>
                        <li className="flex items-start">
                          <Flag className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Harassment or unprofessional behavior</span>
                        </li>
                        <li className="flex items-start">
                          <Flag className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Fraudulent activity or scams</span>
                        </li>
                        <li className="flex items-start">
                          <Flag className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Violation of platform policies</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">How We Handle Reports</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="bg-red-50 border border-red-200 p-2 rounded">
                          <span className="font-medium text-red-800">Quick Response:</span>
                          <span className="text-red-700"> Reports reviewed within 24 hours</span>
                        </div>
                        <div className="bg-orange-50 border border-orange-200 p-2 rounded">
                          <span className="font-medium text-orange-800">Investigation:</span>
                          <span className="text-orange-700"> Thorough review of all evidence</span>
                        </div>
                        <div className="bg-green-50 border border-green-200 p-2 rounded">
                          <span className="font-medium text-green-800">Resolution:</span>
                          <span className="text-green-700"> Appropriate action taken to protect community</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>Community Guidelines:</strong> We're committed to maintaining a safe, respectful environment for all users. Your reports help us ensure that everyone can have positive experiences on our platform.
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