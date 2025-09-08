import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { DollarSign, TrendingUp, Calculator, ArrowLeft } from "lucide-react";

export default function PricingStrategies() {
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
            <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <DollarSign className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">Pricing & Profitability</h1>
            <p className="text-lg text-gray-600">Strategic pricing approaches to maximize your bakery's profitability</p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="h-5 w-5 mr-2 text-green-600" />
                  Pricing Fundamentals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Cost Calculation</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Ingredient costs</li>
                      <li>• Labor time and wages</li>
                      <li>• Overhead expenses</li>
                      <li>• Equipment depreciation</li>
                      <li>• Platform fees</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Profit Margins</h4>
                    <div className="space-y-2 text-sm">
                      <div className="bg-green-50 border border-green-200 p-2 rounded">
                        <span className="font-medium text-green-800">Wedding Cakes:</span>
                        <span className="text-green-700"> 70-80% margin</span>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 p-2 rounded">
                        <span className="font-medium text-blue-800">Custom Cakes:</span>
                        <span className="text-blue-700"> 60-70% margin</span>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 p-2 rounded">
                        <span className="font-medium text-purple-800">Standard Cakes:</span>
                        <span className="text-purple-700"> 50-60% margin</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  Pricing Strategies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Value-Based Pricing</h4>
                      <div className="bg-blue-50 border border-blue-200 p-3 rounded text-sm">
                        <p className="text-blue-800">
                          Price based on the value you provide rather than just costs. Consider the occasion's importance, 
                          your expertise, and the customer's budget.
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Premium Positioning</h4>
                      <div className="bg-purple-50 border border-purple-200 p-3 rounded text-sm">
                        <p className="text-purple-800">
                          Focus on quality, artistry, and exceptional service to justify higher prices. 
                          Build a reputation that supports premium pricing.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-2">Market Research Tips</h4>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• Research local competitor pricing</li>
                      <li>• Survey your target customers about price sensitivity</li>
                      <li>• Test different price points with new products</li>
                      <li>• Consider seasonal price adjustments</li>
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