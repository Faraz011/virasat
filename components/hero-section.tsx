"use client"

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";



export const KenBurnsHero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const heroImages = [
    {
      src: "/hero_img1.png",
      alt: "Intricate Handloom Patterns",
      focus: "center"
    },
    {
      src: "/hero_img1.png", 
      alt: "Master Artisan at Work",
      focus: "left"
    },
    {
      src: "/hero_img1.png",
      alt: "Premium Silk Threads",
      focus: "right"
    },
    {
      src: "/hero_img1.png",
      alt: "Elegant Finished Saree",
      focus: "center"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <section className="relative h-[500px] sm:h-[550px] md:h-[600px] lg:h-[635px] overflow-hidden">
      {/* Dynamic Gradient Overlay */}
      <div className="absolute inset-0 bg-amber-900/15 z-10" />
      
      {/* Ken Burns Image Container */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          
            
              <img
                key={index}
                src={image.src}
                alt={image.alt}
                className={`h-full w-full object-cover ${currentIndex === index ? 'opacity-100' : 'opacity-0 absolute top-0 left-0'} transition-opacity duration-1000`}
                style={{
                  objectPosition: image.focus === 'left' ? 'left center' : 
                                image.focus === 'right' ? 'right center' : 'center center'
                }}
              />
            
          
        ))}
      </div>

      {/* Enhanced Content */}
      <div className="absolute inset-0 flex items-center z-20">
        <div className="container px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="space-y-8 text-white">
              {/* Animated Badge */}
              <div className="animate-slide-up">

                <Badge className="bg-gradient-to-r from-primary/80 to-orange-500/90 text-primary-foreground hover:from-primary/70 hover:to-orange-500 backdrop-blur-md border border-amber-300/30 px-6 py-3 text-base font-medium shadow-2xl">
                  ✨ Heritage Collection
                </Badge>
              </div>

              {/* Main Heading with Stagger Animation */}
              <div className="space-y-3 sm:space-y-4 animate-slide-up-delay-1">
                <h1 className="text-4xl sm:text-5xl font-serif font-bold tracking-tight md:text-6xl lg:text-7xl xl:text-8xl leading-tight">
                  <span className="block opacity-0 animate-fade-in-up">Handwoven</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-200 to-amber-300 opacity-0 animate-fade-in-up-delay text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
                    Elegance
                  </span>
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 animate-fade-in-up-delay-2"></div>
              </div>

              {/* Description */}
              <div className="animate-slide-up-delay-2">
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl opacity-90 leading-relaxed font-light max-w-2xl">
                  Discover the timeless beauty of handcrafted sarees, woven with tradition and passion by master artisans.
                </p>
              </div>
              
              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4 sm:pt-6 animate-slide-up-delay-3">
                <Button 
                  size="lg" 
                  className="group bg-white text-black hover:bg-amber-50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-6 text-base sm:text-lg font-semibold" 
                  asChild
                >
                  <Link href="/shop/featured" className="flex items-center justify-center">
                    Explore Collection
                    <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-black border-2 border-white/70 hover:bg-white/20 hover:border-white hover:shadow-xl backdrop-blur-md w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-6 text-base sm:text-lg font-semibold transition-all duration-500"
                >
                  Our Story
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        <div className="h-1 bg-white/20">
          <div 
            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500 ease-linear"
            style={{ 
              width: `${((currentIndex + 1) / heroImages.length) * 100}%` 
            }}
          />
        </div>
      </div>
    </section>
  );
};
