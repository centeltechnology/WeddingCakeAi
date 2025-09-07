import { Star, Quote, Users, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  review: string;
  weddingDate: string;
  cakeStyle: string;
  image?: string;
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah & Michael Chen",
    location: "San Francisco, CA",
    rating: 5,
    review: "Wedding CakeAI helped us find the perfect baker and estimate our dream cake cost accurately. The AI visualization feature was incredible - we could see exactly how our cake would look before ordering!",
    weddingDate: "June 2024",
    cakeStyle: "3-tier vanilla with roses",
  },
  {
    id: "2", 
    name: "Emily Rodriguez",
    location: "Austin, TX",
    rating: 5,
    review: "As a bride on a budget, the detailed cost breakdown was a lifesaver. We found an amazing local baker through the platform and saved $800 compared to our original quote!",
    weddingDate: "September 2024",
    cakeStyle: "2-tier chocolate with gold accents",
  },
  {
    id: "3",
    name: "Jessica & David Kim",
    location: "Seattle, WA", 
    rating: 5,
    review: "The cake calculator was spot-on with pricing, and the baker directory connected us with someone who perfectly understood our vision. Highly recommend!",
    weddingDate: "October 2024",
    cakeStyle: "4-tier red velvet with peonies",
  },
  {
    id: "4",
    name: "Amanda Thompson",
    location: "Chicago, IL",
    rating: 5,
    review: "Love how detailed the estimates are! We used the platform to compare different designs and found the perfect balance of beauty and budget.",
    weddingDate: "August 2024", 
    cakeStyle: "3-tier lemon with lavender",
  },
  {
    id: "5",
    name: "Maria & James Rodriguez",
    location: "Miami, FL",
    rating: 5,
    review: "Bakewise made planning our wedding cake so much easier! The calculator was incredibly accurate and we found a local baker who created exactly what we envisioned. The whole process was seamless.",
    weddingDate: "November 2024",
    cakeStyle: "5-tier tropical with orchids",
  },
  {
    id: "6",
    name: "Rachel Wong",
    location: "Portland, OR",
    rating: 5,
    review: "As a busy bride planning from out of state, this platform was a lifesaver. I could compare bakers, get accurate pricing, and even see 3D previews of designs. Saved me so much time and stress!",
    weddingDate: "December 2024",
    cakeStyle: "2-tier rustic naked cake with berries",
  },
  {
    id: "7",
    name: "Lauren & Chris Mitchell",
    location: "Nashville, TN",
    rating: 5,
    review: "We had a very specific vision for our cake and the AI recommendations helped us find a baker who specialized in exactly what we wanted. The pricing was transparent and no surprises on the final bill!",
    weddingDate: "January 2025",
    cakeStyle: "4-tier vintage with buttercream roses",
  }
];

const stats = [
  { label: "Happy Couples", value: "2,500+", icon: Users },
  { label: "Trusted Bakers", value: "150+", icon: CheckCircle },
  { label: "Average Savings", value: "$650", icon: Star },
  { label: "Success Rate", value: "98%", icon: Quote }
];

export default function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'start',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 768px)': { slidesToScroll: 2 }
    }
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onInit = useCallback((emblaApi: any) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on('reInit', onInit);
    emblaApi.on('select', onSelect);
  }, [emblaApi, onInit, onSelect]);

  // Auto-play functionality
  useEffect(() => {
    if (!emblaApi) return;

    const autoplay = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000); // Auto-slide every 5 seconds

    return () => clearInterval(autoplay);
  }, [emblaApi]);

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Social Proof Stats */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
            Trusted by Thousands of Couples
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join the couples who found their perfect wedding cake through Wedding CakeAI
          </p>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="flex-[0_0_100%] md:flex-[0_0_50%] px-4">
                  <Card className="relative bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300 h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Quote className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          {/* Rating Stars */}
                          <div className="flex items-center mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < testimonial.rating
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-sm text-muted-foreground">
                              {testimonial.rating}.0
                            </span>
                          </div>
                          
                          {/* Review Text */}
                          <p className="text-foreground mb-4 leading-relaxed">
                            "{testimonial.review}"
                          </p>
                          
                          {/* Customer Info */}
                          <div className="border-t border-border pt-4">
                            <div className="font-semibold text-foreground">
                              {testimonial.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {testimonial.location} • {testimonial.weddingDate}
                            </div>
                            <div className="text-xs text-primary mt-1">
                              {testimonial.cakeStyle}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background shadow-lg"
            onClick={scrollPrev}
            data-testid="button-testimonial-prev"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background shadow-lg"
            onClick={scrollNext}
            data-testid="button-testimonial-next"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === selectedIndex
                    ? "bg-primary scale-110"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                onClick={() => scrollTo(index)}
                data-testid={`button-testimonial-dot-${index}`}
              />
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Ready to plan your dream wedding cake?
          </p>
          <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 py-2">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Free to use • No signup required • Instant estimates
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}