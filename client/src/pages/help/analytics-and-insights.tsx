import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BarChart3, TrendingUp, DollarSign, Users, Calendar, Eye, ArrowLeft, Target } from "lucide-react";

export default function AnalyticsAndInsights() {
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
              <BarChart3 className="h-10 w-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">Analytics & Business Insights</h1>
            <p className="text-lg text-gray-600">
              Understanding your dashboard metrics and using data to grow your bakery business
            </p>
          </div>

          <div className="space-y-8">
            {/* Dashboard Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-blue-600" />
                  Understanding Your Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Key Metrics Explained</h4>
                    <div className="space-y-3">
                      <div className="border border-gray-200 p-3 rounded">
                        <p className="font-medium text-gray-800">Total Revenue</p>
                        <p className="text-sm text-gray-600">Your gross income from all completed orders</p>
                      </div>
                      <div className="border border-gray-200 p-3 rounded">
                        <p className="font-medium text-gray-800">Active Quotes</p>
                        <p className="text-sm text-gray-600">Quotes sent to customers awaiting response</p>
                      </div>
                      <div className="border border-gray-200 p-3 rounded">
                        <p className="font-medium text-gray-800">Conversion Rate</p>
                        <p className="text-sm text-gray-600">Percentage of quotes that become orders</p>
                      </div>
                      <div className="border border-gray-200 p-3 rounded">
                        <p className="font-medium text-gray-800">Average Order Value</p>
                        <p className="text-sm text-gray-600">Mean value of your completed orders</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Performance Indicators</h4>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="bg-green-50 border border-green-200 p-3 rounded">
                        <p className="font-medium text-green-800">Growing Business Signs</p>
                        <ul className="text-green-700 space-y-1 mt-1">
                          <li>• Increasing monthly revenue trends</li>
                          <li>• Higher conversion rates (&gt;25%)</li>
                          <li>• Growing repeat customer percentage</li>
                          <li>• Shorter quote-to-order cycle times</li>
                        </ul>
                      </div>
                      
                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                        <p className="font-medium text-yellow-800">Areas to Monitor</p>
                        <ul className="text-yellow-700 space-y-1 mt-1">
                          <li>• High quote abandonment rates</li>
                          <li>• Declining average order values</li>
                          <li>• Long response times to inquiries</li>
                          <li>• Seasonal revenue fluctuations</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                  Revenue Analytics & Pricing Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Revenue Tracking</h4>
                    <div className="space-y-3 text-sm">
                      <div className="border-l-4 border-green-400 pl-4">
                        <p className="font-medium text-green-800">Monthly Revenue Goals</p>
                        <p className="text-green-700">Set realistic targets based on capacity and market demand</p>
                      </div>
                      <div className="border-l-4 border-blue-400 pl-4">
                        <p className="font-medium text-blue-800">Seasonal Patterns</p>
                        <p className="text-blue-700">Wedding season (spring/summer) vs. birthday cake consistency</p>
                      </div>
                      <div className="border-l-4 border-purple-400 pl-4">
                        <p className="font-medium text-purple-800">Product Mix Analysis</p>
                        <p className="text-purple-700">Compare profitability of different cake types and services</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Pricing Optimization</h4>
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="font-medium text-gray-800 mb-2">Calculate Your True Costs</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• Ingredients and materials</li>
                          <li>• Labor time (including setup/cleanup)</li>
                          <li>• Equipment usage and maintenance</li>
                          <li>• Platform fees and payment processing</li>
                          <li>• Overhead (utilities, rent, insurance)</li>
                        </ul>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="font-medium text-blue-800 mb-2">Profit Margin Targets</p>
                        <ul className="text-xs text-blue-700 space-y-1">
                          <li>• Standard cakes: 60-70% margin</li>
                          <li>• Wedding cakes: 70-80% margin</li>
                          <li>• Custom decorations: 80-90% margin</li>
                          <li>• Rush orders: Add 25-50% premium</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-purple-600" />
                  Customer Analytics & Behavior Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border border-gray-200 p-4 rounded-lg text-center">
                      <h4 className="font-semibold text-gray-800 mb-2">Customer Acquisition</h4>
                      <p className="text-2xl font-bold text-blue-600 mb-1">New vs Returning</p>
                      <p className="text-xs text-gray-600">Track how customers find you and what brings them back</p>
                    </div>
                    
                    <div className="border border-gray-200 p-4 rounded-lg text-center">
                      <h4 className="font-semibold text-gray-800 mb-2">Order Patterns</h4>
                      <p className="text-2xl font-bold text-green-600 mb-1">Frequency & Timing</p>
                      <p className="text-xs text-gray-600">When customers order and how often they return</p>
                    </div>
                    
                    <div className="border border-gray-200 p-4 rounded-lg text-center">
                      <h4 className="font-semibold text-gray-800 mb-2">Preferences</h4>
                      <p className="text-2xl font-bold text-pink-600 mb-1">Popular Choices</p>
                      <p className="text-xs text-gray-600">Most requested flavors, sizes, and decoration styles</p>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Using Customer Data for Growth</h4>
                    <ul className="text-sm text-purple-800 space-y-1">
                      <li>• Create targeted promotions for high-value customer segments</li>
                      <li>• Develop new products based on popular requests</li>
                      <li>• Time marketing campaigns around peak ordering periods</li>
                      <li>• Personalize follow-up communications based on order history</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Growth Strategies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Using Analytics for Business Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Growth Strategies</h4>
                    <div className="space-y-3">
                      <div className="border border-gray-200 p-3 rounded">
                        <h5 className="font-medium text-gray-800">Increase Order Frequency</h5>
                        <p className="text-sm text-gray-600">Follow up with past customers for upcoming events, holidays, and special occasions</p>
                      </div>
                      <div className="border border-gray-200 p-3 rounded">
                        <h5 className="font-medium text-gray-800">Raise Average Order Value</h5>
                        <p className="text-sm text-gray-600">Offer complementary items like cupcakes, cookies, or premium decoration options</p>
                      </div>
                      <div className="border border-gray-200 p-3 rounded">
                        <h5 className="font-medium text-gray-800">Improve Conversion Rate</h5>
                        <p className="text-sm text-gray-600">Optimize your quote response time and presentation quality</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Key Performance Indicators (KPIs)</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>Monthly Active Customers</span>
                        <span className="font-medium">Track growth</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>Customer Lifetime Value</span>
                        <span className="font-medium">Measure loyalty</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>Quote Response Time</span>
                        <span className="font-medium">&lt; 24 hours</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>Customer Satisfaction</span>
                        <span className="font-medium">5-star average</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>Repeat Customer Rate</span>
                        <span className="font-medium">&gt; 30%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reporting and Forecasting */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-orange-600" />
                  Reporting & Business Forecasting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Weekly Reports to Review</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                          <span>New quotes sent and responses received</span>
                        </li>
                        <li className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                          <span>Revenue compared to previous week/month</span>
                        </li>
                        <li className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-purple-500" />
                          <span>New customer acquisitions and referrals</span>
                        </li>
                        <li className="flex items-center">
                          <TrendingUp className="h-4 w-4 mr-2 text-orange-500" />
                          <span>Top-performing products and services</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Planning Ahead</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="bg-blue-50 border border-blue-200 p-2 rounded">
                          <span className="font-medium text-blue-800">Seasonal Forecasting:</span>
                          <span className="text-blue-700"> Plan capacity for wedding season and holidays</span>
                        </div>
                        <div className="bg-green-50 border border-green-200 p-2 rounded">
                          <span className="font-medium text-green-800">Inventory Planning:</span>
                          <span className="text-green-700"> Predict ingredient needs based on booked orders</span>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 p-2 rounded">
                          <span className="font-medium text-purple-800">Capacity Management:</span>
                          <span className="text-purple-700"> Balance workload to avoid overcommitment</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <strong>Pro Tip:</strong> Export your data monthly to track long-term trends and create backup records for tax purposes. Use analytics to identify your most profitable customer segments and cake types.
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