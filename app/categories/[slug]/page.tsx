import { notFound } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { sql } from "@/lib/db"
import { getProductsByCategory } from "@/lib/products"
import { ProductCard } from "@/components/product-card"
import { ProductsLoading } from "@/components/products-loading"
import { Button } from "@/components/ui/button"

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const categories = await sql`SELECT * FROM categories WHERE slug = ${params.slug}`
  const category = categories[0]

  if (!category) {
    return {
      title: "Category Not Found",
      description: "The requested category could not be found",
    }
  }

  return {
    title: `${category.name} Sarees - Virasat`,
    description: `Explore our collection of authentic ${category.name} chanderi sarees. Handcrafted with traditional techniques.`
  }
}

// Category-specific content
const categoryContent = {
  "katan-silk": {
    title: "Katan Silk Collection",
    subtitle: "The Pure Silk Elegance",
    description:
      "Katan silk sarees are crafted from pure silk threads, known for their smooth texture and rich appearance. These sarees are perfect for special occasions and weddings.",
    features: [
      "100% pure silk fabric",
      "Intricate zari work",
      "Rich and luxurious drape",
      "Perfect for bridal wear",
    ],
    uniqueCharacteristics: [
      "Made from pure twisted silk threads (katah in Hindi)",
      "Distinctive fine texture with a natural sheen",
      "Lightweight yet durable fabric",
      "Minimal stretch compared to other silks"
    ],
    weavingTechnique: "Katan silk is created by twisting two pure silk threads together (2-ply) before weaving, which gives it strength and a distinctive texture. The weavers use traditional handlooms with a unique pit shuttle technique that creates the characteristic fine texture.",
    occasions: ["Weddings", "Bridal wear", "Festivals", "Formal events", "Religious ceremonies"],
    history:
      "Katan silk weaving is an ancient craft that originated in the royal courts of India. The pure silk threads create a fabric that is both durable and lustrous, making it a favorite for traditional attire.",
  },
  "pattu-silk": {
    title: "Pattu Silk Collection",
    subtitle: "The Royal Weave",
    description:
      "Pattu silk sarees are known for their rich texture and vibrant colors. These sarees feature intricate zari work and are a symbol of South Indian tradition and culture.",
    features: [
      "Rich silk fabric",
      "Heavy zari borders",
      "Traditional temple designs",
      "Ideal for festivals and weddings",
    ],
    uniqueCharacteristics: [
      "Heavyweight fabric with a rich fall",
      "Intricate temple motifs and checks",
      "Wide contrast borders (jari or zari work)",
      "Vibrant traditional colors"
    ],
    weavingTechnique: "Pattu silk is woven using pure mulberry silk threads with real gold or silver zari. The special korvai technique is used to create contrast borders, where the border and body are woven separately and then interlocked. The traditional pit looms create the characteristic tight weave.",
    occasions: ["Temple festivals", "South Indian weddings", "Classical dance performances", "Traditional ceremonies", "Pongal celebrations"],
    history:
      "Pattu silk has been woven in South India for centuries, with each region developing its own distinctive style. The rich colors and intricate designs make these sarees a timeless classic.",
  },
  "masrise-silk": {
    title: "Masrise Silk Collection",
    subtitle: "The Art of Fine Weaving",
    description:
      "Masrise silk sarees are known for their fine texture and elegant drape. These sarees feature delicate patterns and are perfect for both formal and casual occasions.",
    features: [
      "Lightweight silk fabric",
      "Delicate zari accents",
      "Subtle sheen",
      "Comfortable for all-day wear",
    ],
    uniqueCharacteristics: [
      "Matte finish with a soft luster",
      "Breathable and comfortable",
      "Minimalist designs with subtle patterns",
      "Eco-friendly dyeing processes"
    ],
    weavingTechnique: "Masrise silk is created using a special type of silk thread that's less twisted than regular silk, giving it a unique texture. The weaving involves a combination of plain weave and twill patterns, with extra weft threads creating subtle designs. The process often uses natural dyes for an eco-friendly touch.",
    occasions: ["Daytime events", "Office wear", "Cocktail parties", "Festive gatherings", "Cultural events"],
    history:
      "Masrise silk weaving is a traditional craft that has been passed down through generations. The fine quality of the silk and the intricate weaving techniques make these sarees truly special.",
  },
  "block-print": {
    title: "Block Print Collection",
    subtitle: "Traditional Artistry",
    description:
      "Block print sarees showcase the rich tradition of hand-block printing. Each piece is a work of art, featuring unique patterns and vibrant colors.",
    features: [
      "Hand-block printed",
      "Natural dyes",
      "Unique patterns",
      "Light and comfortable",
    ],
    uniqueCharacteristics: [
      "Each piece is one-of-a-kind",
      "Eco-friendly production process",
      "Breathable natural fabrics",
      "Artisanal imperfections that add character"
    ],
    weavingTechnique: "Block printing involves hand-carved wooden blocks that are dipped in natural dyes and pressed onto fabric. The process includes several stages: washing, printing, drying, and sometimes additional hand-painting. The dabu printing technique uses a special mud-resist method to create intricate designs. Each color requires a separate block and drying time, making it a time-intensive process.",
    occasions: ["Casual outings", "Daytime events", "Beach weddings", "Summer parties", "Boho-chic styling"],
    history:
      "Block printing is an ancient art form that has been practiced in India for centuries. Each block is hand-carved, and the printing is done manually, making each piece unique. The craft has been passed down through generations, with each region developing its own distinctive style and motifs.",
  },
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const categories = await sql`SELECT * FROM categories WHERE slug = ${params.slug}`
  const category = categories[0]

  if (!category) {
    notFound()
  }

  const products = await getProductsByCategory(params.slug)

  // Get category-specific content or use defaults
  const content = categoryContent[params.slug as keyof typeof categoryContent] || {
    title: `${category.name} Collection`,
    subtitle: "Traditional Craftsmanship",
    description: category.description || `Explore our collection of ${category.name} sarees.`,
    features: ["Traditional designs", "Authentic craftsmanship", "Handwoven excellence", "Cultural heritage"],
    history: `${category.name} sarees represent a rich tradition of handloom weaving, passed down through generations of skilled artisans.`,
  }

  return (
    <div className="container py-6 md:py-8 px-4 md:px-6">
      <div className="flex flex-col gap-2 mb-6 md:mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link href="/categories">
              <ChevronLeft className="h-4 w-4" />
              All Categories
            </Link>
          </Button>
        </div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight">{category.name} Sarees</h1>
        {category.description && <p className="text-muted-foreground max-w-3xl">{category.description}</p>}
        {category.region && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Region:</span> {category.region}
          </p>
        )}
      </div>

      {/* Hero image for the category */}
      <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden rounded-lg mb-8 md:mb-12">
        <img
          src={category.image_url || `/placeholder.svg?height=400&width=1200&text=${encodeURIComponent(category.name)}`}
          alt={category.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
          <div className="container px-4 md:px-6">
            <div className="max-w-lg text-white p-4 md:p-6">
              <h2 className="text-2xl md:text-3xl font-serif font-bold mb-2">{content.title}</h2>
              <p className="text-lg md:text-xl text-white/90 mb-4">{content.subtitle}</p>
              <p className="text-white/90 text-sm md:text-base">{content.description}</p>
              <Button className="mt-4 md:mt-6 bg-white text-black hover:bg-white/90">Shop Now</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Information Section */}
      <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
        <div>
          <h3 className="text-xl font-serif font-medium mb-4">About {category.name} Sarees</h3>
          <p className="text-muted-foreground mb-6">{content.history}</p>

          <h4 className="font-medium mb-2">Key Features</h4>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground mb-6">
            {content.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>

          {category.region && (
            <div className="bg-muted/30 p-4 rounded-md">
              <h4 className="font-medium mb-2">Origin</h4>
              <p className="text-sm text-muted-foreground">
                {category.name} sarees originate from {category.region}, where skilled artisans have been practicing
                this craft for generations, preserving traditional techniques and designs.
              </p>
            </div>
          )}
        </div>

        <div className="relative h-[250px] md:h-[300px] overflow-hidden rounded-lg">
          <img
            src={`/placeholder.svg?height=300&width=600&text=${encodeURIComponent(`${category.name} Craftsmanship`)}`}
            alt={`${category.name} Weaving Process`}
            className="h-full w-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <p className="text-white text-sm">
              A master artisan weaving a traditional {category.name} saree using age-old techniques
            </p>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="mb-8">
        <h3 className="text-2xl font-serif font-bold mb-6">Our {category.name} Collection</h3>

        <Suspense fallback={<ProductsLoading count={12} />}>
          {products.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-medium mb-2">No products found</h2>
              <p className="text-muted-foreground">
                We don't have any products in this category yet. Please check back later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </Suspense>
      </div>

      {/* Care Instructions */}
      <div className="bg-muted/20 p-6 rounded-lg mb-8">
        <h3 className="text-xl font-serif font-medium mb-4">Care Instructions for {category.name} Sarees</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium mb-2">Washing</h4>
            <p className="text-sm text-muted-foreground">
              {params.slug === "banarasi-silk" || params.slug === "kanjivaram"
                ? "Dry clean only to preserve the zari work and silk texture."
                : "Hand wash gently in cold water with mild detergent. Do not wring or twist."}
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Storage</h4>
            <p className="text-sm text-muted-foreground">
              Store in a cool, dry place wrapped in a cotton cloth. Avoid hanging for long periods to prevent
              stretching.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Maintenance</h4>
            <p className="text-sm text-muted-foreground">
              {params.slug === "banarasi-silk" || params.slug === "kanjivaram"
                ? "Refold your saree every few months to prevent permanent creases and damage to the zari work."
                : "Iron on low heat when needed. Use a pressing cloth to protect the fabric and any decorative elements."}
            </p>
          </div>
        </div>
      </div>

      {/* Related Categories */}
      <div>
        <h3 className="text-xl font-serif font-medium mb-4">Explore Other Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categoryLinks
            .filter((link) => link.href !== `/categories/${params.slug}`)
            .map((link) => (
              <Link key={link.href} href={link.href} className="group relative overflow-hidden rounded-lg h-[150px]">
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors z-10" />
                <img
                  src={`/placeholder.svg?height=150&width=300&text=${encodeURIComponent(link.name)}`}
                  alt={link.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <h3 className="text-lg font-medium text-white">{link.name}</h3>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  )
}

// Category links for related categories section
const categoryLinks = [
  { name: "Katan Silk", href: "/categories/katan-silk" },
  { name: "Pattu Silk", href: "/categories/pattu-silk" },
  { name: "Masrise Silk", href: "/categories/masrise-silk" },
  { name: "Block Print", href: "/categories/block-print" },
]
