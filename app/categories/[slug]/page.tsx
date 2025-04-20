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
    description: category.description || `Explore our collection of ${category.name} sarees`,
  }
}

// Category-specific content
const categoryContent = {
  "banarasi-silk": {
    title: "Banarasi Silk Tradition",
    subtitle: "The Royal Heritage of Varanasi",
    description:
      "Banarasi silk sarees are known for their gold and silver zari work, intricate designs, and opulent appearance. These sarees are woven in Varanasi and have been a symbol of luxury for centuries.",
    features: [
      "Gold and silver zari work",
      "Intricate floral and paisley motifs",
      "Rich, opulent pallu designs",
      "Traditional wedding attire",
    ],
    history:
      "The art of Banarasi silk weaving dates back to the Mughal era. The intricate designs were inspired by Mughal architecture and Persian motifs, creating a unique blend of cultures.",
  },
  kanjivaram: {
    title: "Kanjivaram Silk Legacy",
    subtitle: "The Pride of Tamil Nadu",
    description:
      "Kanjivaram (or Kanchipuram) silk sarees are known for their durability, pure mulberry silk, and vibrant colors. These sarees feature contrasting borders and are considered auspicious for weddings and special occasions.",
    features: [
      "Pure mulberry silk",
      "Contrasting borders and pallus",
      "Temple designs and motifs",
      "Zari work with pure gold threads",
    ],
    history:
      "The weaving tradition of Kanchipuram dates back to the Chola dynasty. The weavers, who were originally from Andhra Pradesh, settled in Kanchipuram over 400 years ago and developed this distinctive style.",
  },
  chanderi: {
    title: "Chanderi Weaving Art",
    subtitle: "The Sheer Elegance of Madhya Pradesh",
    description:
      "Chanderi sarees are known for their lightweight, sheer texture and delicate work. These sarees are woven with a mix of silk and cotton, creating a subtle sheen and comfortable drape.",
    features: [
      "Lightweight and sheer texture",
      "Subtle sheen and transparency",
      "Traditional butis and motifs",
      "Comfortable for all seasons",
    ],
    history:
      "The weaving tradition of Chanderi began in the 13th century and flourished under the patronage of the Bundela Rajputs. The unique quality of Chanderi is attributed to the special quality of water in the region.",
  },
  jamdani: {
    title: "Jamdani Weaving Mastery",
    subtitle: "The Poetic Expression of Bengal",
    description:
      "Jamdani sarees are known for their intricate hand-woven patterns on fine cotton. This technique creates motifs that appear to float on the surface of the fabric, giving it a distinctive look.",
    features: [
      "Hand-woven floral and geometric patterns",
      "Fine cotton or muslin base",
      "Discontinuous weft technique",
      "Lightweight and comfortable",
    ],
    history:
      "Jamdani weaving is one of the oldest weaving techniques in Bengal, dating back to the Mughal era. It was recognized as a UNESCO Intangible Cultural Heritage in 2013, highlighting its cultural significance.",
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
    <div className="container py-8">
      <div className="flex flex-col gap-2 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link href="/categories">
              <ChevronLeft className="h-4 w-4" />
              All Categories
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">{category.name} Sarees</h1>
        {category.description && <p className="text-muted-foreground max-w-3xl">{category.description}</p>}
        {category.region && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Region:</span> {category.region}
          </p>
        )}
      </div>

      {/* Hero image for the category */}
      <div className="relative h-[400px] w-full overflow-hidden rounded-lg mb-12">
        <img
          src={category.image_url || `/placeholder.svg?height=400&width=1200&text=${encodeURIComponent(category.name)}`}
          alt={category.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
          <div className="container">
            <div className="max-w-lg text-white p-6">
              <h2 className="text-3xl font-serif font-bold mb-2">{content.title}</h2>
              <p className="text-xl text-white/90 mb-4">{content.subtitle}</p>
              <p className="text-white/90">{content.description}</p>
              <Button className="mt-6 bg-white text-black hover:bg-white/90">Shop Now</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Information Section */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
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

        <div className="relative h-[300px] overflow-hidden rounded-lg">
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
  { name: "Banarasi Silk", href: "/categories/banarasi-silk" },
  { name: "Kanjivaram", href: "/categories/kanjivaram" },
  { name: "Chanderi", href: "/categories/chanderi" },
  { name: "Jamdani", href: "/categories/jamdani" },
]
