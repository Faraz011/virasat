import Link from "next/link"
import { ArrowRight, ChevronRight, Star } from "lucide-react"
import { getCategories, getFeaturedProducts } from "@/lib/products"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ProductCard } from "@/components/product-card"

// Sample testimonials data
const testimonials = [
  {
    name: "Priya Sharma",
    location: "Delhi",
    text: "The Banarasi silk saree I purchased for my daughter's wedding was absolutely stunning. The craftsmanship is exquisite, and the customer service was exceptional. It's a family heirloom in the making.",
  },
  {
    name: "Ananya Patel",
    location: "Mumbai",
    text: "I've been collecting handwoven sarees for years, and the pieces from Virasat are truly special. The attention to detail and the quality of the weave is incomparable. Worth every penny.",
  },
  {
    name: "Meera Reddy",
    location: "Bangalore",
    text: "I love that I can learn about the artisans who created my saree. It makes wearing it so much more meaningful knowing I'm supporting traditional craftsmanship and sustainable practices.",
  },
]

export default async function HomePage() {
  // Fetch real data for categories and featured products
  const [categories, featuredProducts] = await Promise.all([getCategories(), getFeaturedProducts(4)])

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 z-10" />
          <div className="relative h-[400px] md:h-[600px] w-full overflow-hidden">
            <img
              src="/placeholder.svg?height=600&width=1920"
              alt="Handwoven Banarasi Silk Saree"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute inset-0 flex items-center z-20">
            <div className="container px-4 md:px-6">
              <div className="max-w-lg space-y-4 text-white">
                <Badge className="bg-primary/80 text-primary-foreground hover:bg-primary/70">Heritage Collection</Badge>
                <h1 className="text-3xl font-serif font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                  Handwoven Elegance
                </h1>
                <p className="text-base md:text-lg opacity-90">
                  Discover the timeless beauty of handcrafted sarees, woven with tradition and passion by master
                  artisans.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button size="lg" className="bg-white text-black hover:bg-white/90 w-full sm:w-auto" asChild>
                    <Link href="/shop/featured">
                      Explore Collection
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-white border-white hover:bg-white/10 w-full sm:w-auto"
                  >
                    Our Story
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* USP Section */}
        <section className="py-6 md:py-8 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 border-b md:border-b-0 md:border-r border-muted-foreground/10 last:border-0">
                <h3 className="font-medium">100% Authentic Handloom</h3>
                <p className="text-sm text-muted-foreground">Certified handwoven sarees from traditional looms</p>
              </div>
              <div className="p-4 border-b md:border-b-0 md:border-r border-muted-foreground/10 last:border-0">
                <h3 className="font-medium">Supporting 200+ Artisan Families</h3>
                <p className="text-sm text-muted-foreground">Direct from weavers to your wardrobe</p>
              </div>
              <div className="p-4">
                <h3 className="font-medium">Sustainable & Ethical Practices</h3>
                <p className="text-sm text-muted-foreground">Preserving heritage with eco-friendly methods</p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12 md:py-16">
          <div className="container">
            <div className="flex flex-col gap-2 mb-8 text-center">
              <h2 className="text-3xl font-serif font-bold tracking-tight">Explore by Weave</h2>
              <p className="text-muted-foreground mx-auto max-w-2xl">
                Each weaving technique tells a unique story, passed down through generations of skilled artisans
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {categories.slice(0, 4).map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group relative overflow-hidden rounded-lg"
                >
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors z-10" />
                  <img
                    src={category.image_url || "/placeholder.svg?height=250&width=320"}
                    alt={category.name}
                    className="h-[250px] w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="text-center">
                      <h3 className="text-xl font-medium text-white">{category.name}</h3>
                      <p className="text-sm text-white/80">{category.region || "Traditional"}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="flex justify-center mt-8">
              <Button variant="outline" asChild>
                <Link href="/categories">
                  View All Categories
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-12 md:py-16 bg-muted/20">
          <div className="container">
            <div className="flex flex-col gap-2 mb-8 text-center">
              <h2 className="text-3xl font-serif font-bold tracking-tight">Curated Collection</h2>
              <p className="text-muted-foreground mx-auto max-w-2xl">
                Handpicked sarees that showcase exceptional craftsmanship and design
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="flex justify-center mt-8">
              <Button variant="outline" size="lg" asChild>
                <Link href="/shop">
                  View All Sarees
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Artisan Story */}
        <section className="py-12 md:py-16">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="relative h-[400px] rounded-lg overflow-hidden">
                <img
                  src="/placeholder.svg?height=400&width=600"
                  alt="Master weaver at work"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-4">
                <Badge>Our Artisans</Badge>
                <h2 className="text-3xl font-serif font-bold tracking-tight">The Hands Behind Our Sarees</h2>
                <p className="text-muted-foreground">
                  Each saree in our collection is the result of weeks of meticulous work by skilled artisans who have
                  inherited their craft through generations. We work directly with weaver communities across India,
                  ensuring fair wages and preserving traditional techniques.
                </p>
                <p className="text-muted-foreground">
                  When you purchase a handwoven saree from us, you're not just buying a garment – you're supporting a
                  cultural heritage and the livelihoods of artisan families.
                </p>
                <Button variant="outline">
                  Meet Our Weavers
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Collections */}
        <section className="py-12 md:py-16 bg-muted/20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col gap-2 mb-8 text-center">
              <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-tight">Seasonal Collections</h2>
              <p className="text-muted-foreground mx-auto max-w-2xl">
                Explore our specially curated collections for every occasion
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="relative rounded-lg overflow-hidden group h-[250px] md:h-[300px]">
                <img
                  src="/placeholder.svg?height=300&width=400"
                  alt="Festive Collection"
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6 text-white">
                  <h3 className="text-xl font-medium">Festive Collection</h3>
                  <p className="text-sm opacity-90 mb-4">Celebrate special occasions with our vibrant festive sarees</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-fit border-white text-white hover:bg-white/10"
                    asChild
                  >
                    <Link href="/shop/featured">
                      Explore
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="relative rounded-lg overflow-hidden group h-[300px]">
                <img
                  src="/placeholder.svg?height=300&width=400"
                  alt="Bridal Collection"
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6 text-white">
                  <h3 className="text-xl font-medium">Bridal Collection</h3>
                  <p className="text-sm opacity-90 mb-4">Timeless heirlooms for your special day</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-fit border-white text-white hover:bg-white/10"
                    asChild
                  >
                    <Link href="/shop/featured">
                      Explore
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="relative rounded-lg overflow-hidden group h-[300px]">
                <img
                  src="/placeholder.svg?height=300&width=400"
                  alt="Everyday Elegance"
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6 text-white">
                  <h3 className="text-xl font-medium">Everyday Elegance</h3>
                  <p className="text-sm opacity-90 mb-4">Lightweight, comfortable sarees for daily wear</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-fit border-white text-white hover:bg-white/10"
                    asChild
                  >
                    <Link href="/shop/new-arrivals">
                      Explore
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-12 md:py-16">
          <div className="container">
            <div className="flex flex-col gap-2 mb-8 text-center">
              <h2 className="text-3xl font-serif font-bold tracking-tight">Customer Stories</h2>
              <p className="text-muted-foreground mx-auto max-w-2xl">
                Hear from our customers who cherish their handwoven treasures
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-muted/10">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                        ))}
                      </div>
                      <p className="text-muted-foreground italic">"{testimonial.text}"</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="h-10 w-10 rounded-full overflow-hidden">
                          <img
                            src="/placeholder.svg?height=40&width=40"
                            alt={testimonial.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Care Guide */}
        <section className="py-12 md:py-16 bg-muted/20">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <Badge>Saree Care</Badge>
              <h2 className="text-3xl font-serif font-bold tracking-tight">Caring for Your Handwoven Treasures</h2>
              <p className="text-muted-foreground">
                Handwoven sarees are not just garments; they're works of art that deserve special care. Learn how to
                preserve their beauty for generations.
              </p>
              <Button variant="outline" className="mt-2">
                View Care Guide
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-12 md:py-16 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
              <div className="space-y-2 text-center md:text-left">
                <h2 className="text-2xl font-serif font-bold">Join Our Community</h2>
                <p className="text-sm md:text-base">
                  Be the first to know about new collections, artisan stories, and exclusive offers
                </p>
              </div>
              <div className="w-full md:w-auto">
                <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto md:mx-0">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="bg-primary-foreground text-foreground placeholder:text-muted-foreground"
                  />
                  <Button variant="secondary" className="sm:w-auto">
                    Subscribe
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
