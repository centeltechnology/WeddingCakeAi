import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Link } from "wouter";
import { 
  Heart, 
  Users, 
  Target, 
  Award, 
  ChefHat, 
  Sparkles, 
  Globe,
  TrendingUp,
  Star,
  ArrowRight
} from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-200/30 to-rose-300/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-200/30 to-pink-300/30 rounded-full blur-3xl"></div>
      </div>
      
      <NavigationHeader />
      
      {/* Hero Section */}
      <div className="relative py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center px-4 py-2 mb-8 bg-white/60 backdrop-blur-md border border-pink-200/50 rounded-full shadow-lg">
            <Heart className="h-4 w-4 text-pink-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">Built with Love for Bakers</span>
            <Sparkles className="h-4 w-4 text-pink-500 ml-2" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Sweet Dreams Start
            </span>
            <br />
            <span className="bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 bg-clip-text text-transparent">
              With Great Tools
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
            We're passionate about helping cake decorators, bakeries, and dessert artists 
            <span className="text-pink-600 font-medium"> build thriving businesses</span> with the tools they deserve.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="relative py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <Card className="border-0 bg-white/70 backdrop-blur-md shadow-2xl" data-testid="card-mission">
              <CardHeader className="pb-6">
                <div className="w-16 h-16 mb-4 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-3xl font-serif font-bold text-gray-900 mb-2">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Every cake tells a story, celebrates a moment, and brings joy to people's lives. 
                  We believe the talented artists who create these masterpieces deserve technology 
                  that's as beautiful and intuitive as their work.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  That's why we built BakerIQ - to eliminate the business complexity and let you 
                  focus on what you do best: creating unforgettable cakes and experiences.
                </p>
              </CardContent>
            </Card>

            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Customer-First Approach</h3>
                  <p className="text-gray-600">Every feature is designed with real baker feedback and tested in actual cake businesses.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Industry Expertise</h3>
                  <p className="text-gray-600">Built by team members with backgrounds in culinary arts, business management, and technology.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Proven Results</h3>
                  <p className="text-gray-600">Our platform has helped hundreds of bakers increase revenue by an average of 300%.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative py-16 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Making a Sweet Impact
            </h2>
            <p className="text-xl text-gray-600">The numbers speak for themselves</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-600 mb-2">500+</div>
              <div className="text-gray-600">Happy Bakers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">$2M+</div>
              <div className="text-gray-600">Revenue Generated</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">10K+</div>
              <div className="text-gray-600">Quotes Created</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">98%</div>
              <div className="text-gray-600">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Vision */}
      <div className="relative py-20">
        <div className="container mx-auto px-4">
          <Card className="border-0 bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-md shadow-2xl overflow-hidden max-w-4xl mx-auto" data-testid="card-vision">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5"></div>
            <CardContent className="text-center py-16 relative">
              <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl">
                <Globe className="h-10 w-10 text-white" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Our Vision for the Future
              </h2>
              
              <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto mb-8">
                We envision a world where every talented baker has access to enterprise-level business tools, 
                AI-powered design assistance, and a thriving community of fellow creators. Where running a 
                cake business is as sweet as the cakes themselves.
              </p>
              
              <div className="flex justify-center mb-8">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <Button asChild size="lg" className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-3" data-testid="button-join-journey">
                <Link href="/signup" className="flex items-center">
                  Join Our Sweet Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}