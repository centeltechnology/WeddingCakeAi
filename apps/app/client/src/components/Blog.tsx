import { Calendar, Clock, ArrowRight, BookOpen, Heart, Star } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  publishDate: string;
  image?: string;
  featured?: boolean;
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "The Ultimate Wedding Cake Cost Guide for 2024",
    excerpt: "Everything you need to know about wedding cake pricing, from basic designs to elaborate custom creations. Learn how to budget effectively for your dream cake.",
    category: "Pricing Guide",
    readTime: "8 min read",
    publishDate: "2024-01-15",
    featured: true
  },
  {
    id: "2", 
    title: "10 Most Popular Wedding Cake Flavors This Year",
    excerpt: "Discover the trending flavors that couples are choosing for their special day, from classic vanilla to unique lavender honey combinations.",
    category: "Trends",
    readTime: "5 min read",
    publishDate: "2024-01-10"
  },
  {
    id: "3",
    title: "How to Choose the Perfect Wedding Cake Size",
    excerpt: "Calculate exactly how many guests your cake will serve and avoid over or under-ordering with our comprehensive sizing guide.",
    category: "Planning Tips",
    readTime: "6 min read", 
    publishDate: "2024-01-05"
  },
  {
    id: "4",
    title: "Seasonal Wedding Cake Ideas: Spring Edition",
    excerpt: "Beautiful spring-inspired cake designs featuring fresh flowers, pastel colors, and seasonal flavors that capture the essence of the season.",
    category: "Seasonal Ideas",
    readTime: "7 min read",
    publishDate: "2024-01-01"
  },
  {
    id: "5",
    title: "Questions to Ask Your Wedding Cake Baker",
    excerpt: "Essential questions that will help you find the right baker and ensure your cake exceeds expectations on your wedding day.",
    category: "Baker Selection",
    readTime: "4 min read",
    publishDate: "2023-12-28"
  },
  {
    id: "6",
    title: "Budget-Friendly Wedding Cake Alternatives",
    excerpt: "Creative and delicious alternatives to traditional wedding cakes that can help you save money without compromising on style.",
    category: "Budget Tips",
    readTime: "6 min read",
    publishDate: "2023-12-25"
  }
];

const categories = [
  "All Posts",
  "Pricing Guide", 
  "Planning Tips",
  "Trends",
  "Seasonal Ideas",
  "Baker Selection",
  "Budget Tips"
];

export default function Blog() {
  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center items-center space-x-2 mb-4">
          <BookOpen className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-serif font-bold text-foreground">
            Wedding Cake Blog
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Expert tips, trends, and guides to help you plan the perfect wedding cake for your special day
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {categories.map((category) => (
          <Button
            key={category}
            variant={category === "All Posts" ? "default" : "outline"}
            size="sm"
            className="rounded-full"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Featured Post */}
      {featuredPost && (
        <Card className="mb-12 overflow-hidden bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="bg-primary/5 p-8 md:p-12 flex flex-col justify-center">
                <div className="inline-flex items-center space-x-2 mb-4">
                  <Star className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Featured Post</span>
                </div>
                <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
                  {featuredPost.title}
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(featuredPost.publishDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{featuredPost.readTime}</span>
                  </div>
                </div>
                <Button className="w-fit">
                  Read Full Article
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 flex items-center justify-center">
                <div className="text-center">
                  <Heart className="w-24 h-24 text-primary/60 mx-auto mb-4" />
                  <p className="text-primary font-medium">Featured Article</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blog Posts Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {regularPosts.map((post) => (
          <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                  {post.category}
                </span>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{post.readTime}</span>
                </div>
              </div>
              <h3 className="text-xl font-serif font-semibold text-foreground group-hover:text-primary transition-colors">
                {post.title}
              </h3>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(post.publishDate).toLocaleDateString()}</span>
                </div>
                <Button variant="ghost" size="sm" className="group-hover:text-primary">
                  Read More
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center mt-16 p-8 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl">
        <h3 className="text-2xl font-serif font-bold text-foreground mb-4">
          Ready to Plan Your Dream Wedding Cake?
        </h3>
        <p className="text-muted-foreground mb-6">
          Use our AI-powered calculator to get instant pricing estimates and find the perfect baker for your special day.
        </p>
        <Button size="lg" className="bg-primary hover:bg-primary/90">
          Start Planning Your Cake
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}