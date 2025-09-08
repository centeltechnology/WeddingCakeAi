import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { MessageSquare, Clock, Star, Heart, Phone, Mail, ArrowLeft, Users, AlertTriangle } from "lucide-react";

export default function CustomerCommunications() {
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
            <div className="bg-blue-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <MessageSquare className="h-10 w-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">Managing Customer Communications</h1>
            <p className="text-lg text-gray-600">
              Best practices for professional, effective communication that builds trust and delights customers
            </p>
          </div>

          <div className="space-y-8">
            {/* First Impressions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-blue-600" />
                  Making Great First Impressions
                </CardTitle>
                <CardDescription>How to respond to initial inquiries and quote requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Response Timeline</h4>
                    <div className="space-y-3">
                      <div className="border-l-4 border-green-400 pl-4">
                        <p className="font-medium text-green-800">Within 2 hours (ideal)</p>
                        <p className="text-sm text-green-700">Shows exceptional responsiveness and availability</p>
                      </div>
                      <div className="border-l-4 border-blue-400 pl-4">
                        <p className="font-medium text-blue-800">Within 24 hours (expected)</p>
                        <p className="text-sm text-blue-700">Professional standard that meets most customer expectations</p>
                      </div>
                      <div className="border-l-4 border-red-400 pl-4">
                        <p className="font-medium text-red-800">Over 48 hours (poor)</p>
                        <p className="text-sm text-red-700">Customers may seek other bakers by this point</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Initial Response Template</h4>
                    <div className="bg-gray-50 p-4 rounded-lg text-sm">
                      <p className="mb-2">Hi [Customer Name],</p>
                      <p className="mb-2">
                        Thank you for considering [Your Bakery Name] for your [event type]! I'm excited to learn more about your vision.
                      </p>
                      <p className="mb-2">
                        I've reviewed your initial details and have a few questions to ensure I create the perfect quote for you:
                      </p>
                      <p className="mb-2">
                        [Insert 2-3 specific questions based on their request]
                      </p>
                      <p className="mb-2">
                        I'll have a detailed quote ready for you within [timeframe] once I have these details.
                      </p>
                      <p>Best regards,<br/>[Your Name]</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Communication Channels */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-blue-600" />
                  Choosing the Right Communication Channel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border border-gray-200 p-4 rounded-lg">
                    <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800 text-center mb-2">Platform Messaging</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Best for:</strong> Initial quotes, order details, routine updates</p>
                      <p><strong>Benefits:</strong> Recorded history, payment integration, easy file sharing</p>
                      <p><strong>When to use:</strong> 90% of all communications</p>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 p-4 rounded-lg">
                    <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <Phone className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800 text-center mb-2">Phone Calls</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Best for:</strong> Complex design discussions, urgent issues, relationship building</p>
                      <p><strong>Benefits:</strong> Personal touch, immediate clarification, faster problem-solving</p>
                      <p><strong>When to use:</strong> Complex orders, upset customers, final confirmations</p>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 p-4 rounded-lg">
                    <div className="bg-purple-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <Mail className="h-6 w-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800 text-center mb-2">Email/Text</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Best for:</strong> Appointment reminders, delivery updates, follow-ups</p>
                      <p><strong>Benefits:</strong> Direct delivery, mobile-friendly, automation possible</p>
                      <p><strong>When to use:</strong> Supplementary to platform messaging only</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-6">
                  <p className="text-sm text-yellow-800">
                    <strong>Pro Tip:</strong> Always use the Bakewise platform messaging as your primary communication method. 
                    This ensures payment protection, maintains order history, and provides both parties with documented conversations.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Consultation Best Practices */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  Conducting Effective Consultations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Consultation Preparation</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-pink-400 rounded-full mr-2 mt-2"></div>
                          <span>Review their initial request and any inspiration photos</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-pink-400 rounded-full mr-2 mt-2"></div>
                          <span>Prepare a list of clarifying questions</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-pink-400 rounded-full mr-2 mt-2"></div>
                          <span>Have your portfolio and pricing information ready</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-pink-400 rounded-full mr-2 mt-2"></div>
                          <span>Check your calendar for potential delivery dates</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Key Discussion Points</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 mt-2"></div>
                          <span>Event details: date, time, location, guest count</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 mt-2"></div>
                          <span>Design vision: style, colors, theme, inspiration</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 mt-2"></div>
                          <span>Flavor preferences and dietary restrictions</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 mt-2"></div>
                          <span>Budget range and payment preferences</span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 mt-2"></div>
                          <span>Delivery/pickup logistics and setup needs</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Setting Expectations</h4>
                    <p className="text-sm text-blue-800 mb-2">
                      Be clear about your process, timeline, and what customers can expect:
                    </p>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Quote delivery timeline (usually 24-48 hours)</li>
                      <li>• Design process and approval stages</li>
                      <li>• Communication preferences and response times</li>
                      <li>• Change request policies and deadlines</li>
                      <li>• Payment schedule and accepted methods</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ongoing Communication */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-600" />
                  Project Updates & Progress Communication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Update Schedule</h4>
                    <div className="space-y-3">
                      <div className="bg-green-50 border border-green-200 p-3 rounded">
                        <p className="font-medium text-green-800">Contract Signing</p>
                        <p className="text-sm text-green-700">Confirm order details, payment schedule, and next steps</p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                        <p className="font-medium text-blue-800">2 Weeks Before</p>
                        <p className="text-sm text-blue-700">Final headcount confirmation and any last-minute changes</p>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 p-3 rounded">
                        <p className="font-medium text-purple-800">1 Week Before</p>
                        <p className="text-sm text-purple-700">Final payment reminder and delivery logistics confirmation</p>
                      </div>
                      <div className="bg-pink-50 border border-pink-200 p-3 rounded">
                        <p className="font-medium text-pink-800">Day Before</p>
                        <p className="text-sm text-pink-700">Final delivery confirmation and any day-of contact details</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Update Message Templates</h4>
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-3 rounded text-xs">
                        <p className="font-medium mb-1">Progress Update Template:</p>
                        <p>
                          "Hi [Name], I wanted to give you an update on your [event] cake! I've completed [specific milestone] 
                          and everything is progressing beautifully. Next, I'll be working on [next steps]. 
                          Your cake will be ready right on schedule for [date]!"
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded text-xs">
                        <p className="font-medium mb-1">Delivery Day Template:</p>
                        <p>
                          "Good morning [Name]! Your gorgeous cake is complete and ready for delivery today. 
                          I'll be arriving at [location] between [time range]. Please ensure someone is available 
                          to receive and someone can show me to the setup location. So excited for your big day!"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Handling Difficult Situations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                  Handling Challenges & Difficult Situations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Common Challenging Scenarios</h4>
                      <div className="space-y-3 text-sm">
                        <div className="border border-orange-200 bg-orange-50 p-3 rounded">
                          <p className="font-medium text-orange-800">Last-Minute Changes</p>
                          <p className="text-orange-700">
                            "I understand you'd like to adjust the design. Let me check what's possible at this stage 
                            and any additional costs involved."
                          </p>
                        </div>
                        
                        <div className="border border-red-200 bg-red-50 p-3 rounded">
                          <p className="font-medium text-red-800">Budget Concerns</p>
                          <p className="text-red-700">
                            "I want to work within your budget. Let's explore some alternatives that can reduce 
                            costs while still achieving your vision."
                          </p>
                        </div>
                        
                        <div className="border border-yellow-200 bg-yellow-50 p-3 rounded">
                          <p className="font-medium text-yellow-800">Delivery Issues</p>
                          <p className="text-yellow-700">
                            "I sincerely apologize for this delay. Here's exactly what happened and how I'm fixing it. 
                            Your satisfaction is my top priority."
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">De-escalation Strategies</h4>
                      <ol className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start">
                          <span className="bg-blue-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                          <span><strong>Listen actively</strong> - Let them express their concerns completely</span>
                        </li>
                        <li className="flex items-start">
                          <span className="bg-blue-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                          <span><strong>Acknowledge feelings</strong> - "I understand how frustrating this must be"</span>
                        </li>
                        <li className="flex items-start">
                          <span className="bg-blue-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                          <span><strong>Take responsibility</strong> - Own your part without making excuses</span>
                        </li>
                        <li className="flex items-start">
                          <span className="bg-blue-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">4</span>
                          <span><strong>Offer solutions</strong> - Present 2-3 concrete options for resolution</span>
                        </li>
                        <li className="flex items-start">
                          <span className="bg-blue-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">5</span>
                          <span><strong>Follow through</strong> - Do exactly what you promise, when you promise</span>
                        </li>
                      </ol>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-2">When to Escalate</h4>
                    <p className="text-sm text-red-800 mb-2">
                      Contact Bakewise support if you encounter:
                    </p>
                    <ul className="text-xs text-red-700 space-y-1">
                      <li>• Threats or abusive language from customers</li>
                      <li>• Disputes you cannot resolve after multiple attempts</li>
                      <li>• Payment issues or chargeback notifications</li>
                      <li>• Requests that violate platform policies</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Building Relationships */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-pink-600" />
                  Building Long-Term Customer Relationships
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Post-Delivery Follow-Up</h4>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="border-l-4 border-pink-300 pl-3">
                        <p className="font-medium">Same Day</p>
                        <p>Quick check-in to ensure delivery went smoothly</p>
                      </div>
                      <div className="border-l-4 border-blue-300 pl-3">
                        <p className="font-medium">3-5 Days Later</p>
                        <p>Thank you message with request for photo sharing and review</p>
                      </div>
                      <div className="border-l-4 border-green-300 pl-3">
                        <p className="font-medium">1 Month Later</p>
                        <p>Check in about their event and future cake needs</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Relationship Building Tips</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start">
                        <Star className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Remember personal details and reference them in future communications</span>
                      </li>
                      <li className="flex items-start">
                        <Star className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Share behind-the-scenes photos of their cake being made</span>
                      </li>
                      <li className="flex items-start">
                        <Star className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Offer special discounts for repeat customers and referrals</span>
                      </li>
                      <li className="flex items-start">
                        <Star className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Send holiday greetings and birthday reminders</span>
                      </li>
                      <li className="flex items-start">
                        <Star className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Ask for referrals and testimonials from satisfied customers</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-pink-50 border border-pink-200 p-4 rounded-lg mt-6">
                  <h4 className="font-semibold text-pink-900 mb-2">Building Your Reputation</h4>
                  <p className="text-sm text-pink-800">
                    Great communication is the foundation of five-star reviews and repeat business. Customers 
                    remember how you made them feel just as much as how their cake tasted. Prioritize 
                    responsiveness, transparency, and genuine care in every interaction.
                  </p>
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