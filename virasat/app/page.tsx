import Link from "next/link"
import { ArrowRight, ChevronRight, Heart, Search, ShoppingBag, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-serif font-bold text-xl">
              Virasat
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link href="/home" className="text-sm font-medium hover:underline underline-offset-4">
                Home
              </Link>
              <Link href="/collection" className="text-sm font-medium hover:underline underline-offset-4">
                Collections
              </Link>
              <Link href="/silk sarees" className="text-sm font-medium hover:underline underline-offset-4">
                Silk Sarees
              </Link>
              <Link href="cotton sarees" className="text-sm font-medium hover:underline underline-offset-4">
                Cotton Sarees
              </Link>
              <Link href="our artisans" className="text-sm font-medium hover:underline underline-offset-4">
                Our Artisans
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <form className="hidden md:flex relative">
              <Input type="search" placeholder="Search sarees..." className="w-64 pr-8" />
              <Button size="sm" variant="ghost" className="absolute right-0 top-0 h-full">
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
            </form>
            <Link href="/register" className="flex items-center gap-1 text-sm font-medium">
              <span className="hidden sm:inline">Account</span>
            </Link>
            <Link href="#" className="relative">
              <Heart className="h-5 w-5" />
              <span className="sr-only">Wishlist</span>
            </Link>
            <Link href="#" className="relative">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                2
              </span>
              <span className="sr-only">Cart</span>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30 z-10" />
          <div className="relative h-[600px] w-full overflow-hidden">
            <img
              src="/photo.jpg?height=600&width=1920"
              alt="Handwoven Banarasi Silk Saree"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute inset-0 flex items-center z-20">
            <div className="container">
              <div className="max-w-lg space-y-4 text-white">
                <Badge className="bg-primary/80 text-primary-foreground hover:bg-primary/70">Heritage Collection</Badge>
                <h1 className="text-4xl font-serif font-bold tracking-tight sm:text-5xl md:text-6xl">
                  Handwoven Elegance
                </h1>
                <p className="text-lg opacity-90">
                  Discover the timeless beauty of handcrafted sarees, woven with tradition and passion by master
                  artisans.
                </p>
                <div className="flex gap-4 pt-2">
                  <Button size="lg" className="bg-white text-black hover:bg-white/90">
                    Explore Collection
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" className="text-black border-white hover:bg-white/90">
                    Our Story
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* USP Section */}
        <section className="py-8 bg-muted/30">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4">
                <h3 className="font-medium">100% Authentic Handloom</h3>
                <p className="text-sm text-muted-foreground">Certified handwoven sarees from traditional looms</p>
              </div>
              <div className="p-4">
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
              {sareeCategories.map((category) => (
                <Link key={category.name} href="#" className="group relative overflow-hidden rounded-lg">
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors z-10" />
                  <img
                    src={category.image || "/photo3.jpg"}
                    alt={category.name}
                    className="h-[250px] w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="text-center">
                      <h3 className="text-xl font-medium text-white">{category.name}</h3>
                      <p className="text-sm text-white/80">{category.region}</p>
                    </div>
                  </div>
                </Link>
              ))}
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
              {featuredSarees.map((saree) => (
                <Card key={saree.id} className="overflow-hidden group border-0 shadow-sm">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={saree.image || "/placeholder.svg"}
                      alt={saree.name}
                      className="object-cover w-full h-full transition-transform group-hover:scale-105"
                    />
                    {saree.badge && (
                      <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-0.5 text-xs font-medium rounded">
                        {saree.badge}
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white/90 text-black rounded-full"
                    >
                      <Heart className="h-4 w-4" />
                      <span className="sr-only">Add to wishlist</span>
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{saree.type}</p>
                      <h3 className="font-medium">{saree.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">₹{saree.price.toLocaleString("en-IN")}</span>
                        {saree.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            ₹{saree.originalPrice.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < saree.rating ? "fill-primary text-primary" : "fill-muted text-muted"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">({saree.reviews})</span>
                      </div>
                      <Button className="w-full mt-2">Add to Cart</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-center mt-8">
              <Button variant="outline" size="lg">
                View All Sarees
                <ArrowRight className="ml-2 h-4 w-4" />
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
                  src="/photo2.jpeg?height=400&width=600"
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
          <div className="container">
            <div className="flex flex-col gap-2 mb-8 text-center">
              <h2 className="text-3xl font-serif font-bold tracking-tight">Seasonal Collections</h2>
              <p className="text-muted-foreground mx-auto max-w-2xl">
                Explore our specially curated collections for every occasion
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative rounded-lg overflow-hidden group h-[300px]">
                <img
                  src="/placeholder.svg?height=300&width=400"
                  alt="Festive Collection"
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6 text-white">
                  <h3 className="text-xl font-medium">Festive Collection</h3>
                  <p className="text-sm opacity-90 mb-4">Celebrate special occasions with our vibrant festive sarees</p>
                  <Button size="sm" variant="outline" className="w-fit border-white text-white hover:bg-white/10">
                    Explore
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="relative rounded-lg overflow-hidden group h-[300px]">
                <img
                  src="/saree.jpg?height=300&width=400"
                  alt="Bridal Collection"
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6 text-white">
                  <h3 className="text-xl font-medium">Bridal Collection</h3>
                  <p className="text-sm opacity-90 mb-4">Timeless heirlooms for your special day</p>
                  <Button size="sm" variant="outline" className="w-fit border-white text-white hover:bg-white/10">
                    Explore
                    <ChevronRight className="ml-1 h-4 w-4" />
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
                  <Button size="sm" variant="outline" className="w-fit border-white text-white hover:bg-white/10">
                    Explore
                    <ChevronRight className="ml-1 h-4 w-4" />
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
          <div className="container">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2 text-center md:text-left">
                <h2 className="text-2xl font-serif font-bold">Join Our Community</h2>
                <p>Be the first to know about new collections, artisan stories, and exclusive offers</p>
              </div>
              <div className="w-full md:w-auto">
                <form className="flex gap-2 max-w-md mx-auto md:mx-0">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="bg-primary-foreground text-foreground placeholder:text-muted-foreground"
                  />
                  <Button variant="secondary">Subscribe</Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="container py-8 md:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium font-serif">Shop</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Silk Sarees
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Cotton Sarees
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Linen Sarees
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Bridal Collection
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium font-serif">About</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Our Story
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Artisan Communities
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Sustainability
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Press
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium font-serif">Customer Care</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Shipping & Returns
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Saree Care Guide
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Size Guide
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium font-serif">Connect</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Instagram
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Facebook
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Pinterest
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    YouTube
                  </Link>
                </li>
              </ul>
              <div className="pt-2">
                <h4 className="text-sm font-medium mb-2">We Accept</h4>
                <div className="flex gap-2">
                  <div className="h-8 w-12 bg-muted rounded"></div>
                  <div className="h-8 w-12 bg-muted rounded"></div>
                  <div className="h-8 w-12 bg-muted rounded"></div>
                  <div className="h-8 w-12 bg-muted rounded"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t mt-8 pt-8">
            <p className="text-sm text-muted-foreground">
              © 2025 Virasat. All rights reserved. Celebrating the art of handwoven sarees.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}


// Sample data
const sareeCategories = [
  {
    name: "Banarasi Silk",
    region: "Varanasi, Uttar Pradesh",
    image: "/placeholder.svg?height=250&width=320",
  },
  {
    name: "Kanjivaram",
    region: "Kanchipuram, Tamil Nadu",
    image: "/placeholder.svg?height=250&width=320",
  },
  {
    name: "Chanderi",
    region: "Chanderi, Madhya Pradesh",
    image: "/placeholder.svg?height=250&width=320",
  },
  {
    name: "Jamdani",
    region: "West Bengal",
    image: "/placeholder.svg?height=250&width=320",
  },
]

const featuredSarees = [
  {
    id: 1,
    name: "Royal Banarasi Silk Saree",
    type: "Banarasi Silk",
    price: 18500,
    originalPrice: 22000,
    rating: 5,
    reviews: 28,
    badge: "Bestseller",
    image: "/placeholder.svg?height=600&width=450",
  },
  {
    id: 2,
    name: "Peacock Motif Kanjivaram",
    type: "Kanjivaram Silk",
    price: 24999,
    rating: 5,
    reviews: 16,
    badge: "New",
    image: "/placeholder.svg?height=600&width=450",
  },
  {
    id: 3,
    name: "Pastel Chanderi Cotton Silk",
    type: "Chanderi",
    price: 6999,
    originalPrice: 8500,
    rating: 4,
    reviews: 42,
    badge: "Sale",
    image: "/placeholder.svg?height=600&width=450",
  },
  {
    id: 4,
    name: "Floral Jamdani Handloom",
    type: "Jamdani",
    price: 12500,
    rating: 4,
    reviews: 35,
    image: "/placeholder.svg?height=600&width=450",
  },
]

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

