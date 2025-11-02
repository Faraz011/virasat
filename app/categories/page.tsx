import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getCategories, getProductsByCategory } from "@/lib/products"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"

export const metadata = {
  title: "Categories - Virasat Handwoven Sarees",
  description: "Explore our collection of authentic handwoven sarees by category",
}

// Main category types we want to feature
const featuredCategoryTypes = [
  {
    slug: "Katan-silk",
    name: "Katan Silk",
    description: "Luxurious silk sarees from Varanasi known for their gold and silver brocade or zari work.",
  },
  {
    slug: "Pattu-silk",
    name: "Pattu silk",
    description: "Traditional silk sarees from Kanchipuram, Tamil Nadu, known for their durability and vibrant colors.",
  },
  {
    slug: "Masrise Silk",
    name: "Masrise Silk",
    description: "Lightweight sarees with a sheer texture, featuring traditional motifs and zari borders.",
  },
  {
    slug: "Block Print",
    name: "Block Print",
    description: "Fine muslin sarees with intricate hand-woven floral or geometric patterns.",
  },
]

export default async function CategoriesPage() {
  const categories = await getCategories()

  // Fetch a few products for each featured category to display
  const categoryProducts = await Promise.all(
    featuredCategoryTypes.map(async (category) => {
      const products = await getProductsByCategory(category.slug, 4)
      return {
        ...category,
        products,
      }
    }),
  )

  return (
    <div className="container py-6 md:py-8 px-4 md:px-6">
      <div className="flex flex-col gap-2 mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight">Chanderi sarees</h1>
        <p className="text-muted-foreground max-w-3xl">
          Explore our collection of authentic handwoven chanderi sarees. Each category uses different raw material.
          
        </p>
      </div>

      {/* All Categories Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-12 md:mb-16">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group relative overflow-hidden rounded-lg h-[180px] md:h-[200px]"
          >
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors z-10" />
            <img
              src={category.image_url || "/placeholder.svg?height=200&width=300"}
              alt={category.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 flex flex-col justify-center items-center z-20 p-4 text-center">
              <h2 className="text-lg md:text-xl font-serif font-bold text-white mb-1">{category.name}</h2>
              {category.region && <p className="text-white/90 text-sm">{category.region}</p>}
            </div>
          </Link>
        ))}
      </div>

      {/* Individual Category Sections */}
      {categoryProducts.map((category, index) => (
        <section key={category.slug} className={`py-12 ${index % 2 === 1 ? "bg-muted/20" : ""}`}>
          <div className="container">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-serif font-bold tracking-tight">{category.name} Sarees</h2>
                <p className="text-muted-foreground max-w-2xl mt-2">{category.description}</p>
              </div>
              <Button variant="outline" asChild>
                <Link href={`/categories/${category.slug}`}>
                  View All {category.name} Sarees
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Category Hero Image */}
            <div className="relative h-[300px] w-full overflow-hidden rounded-lg mb-8">
              <img
                src={`/placeholder.svg?height=300&width=1200&text=${encodeURIComponent(category.name)}`}
                alt={category.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center">
                <div className="text-white p-8 max-w-lg">
                  <h3 className="text-2xl font-serif font-bold mb-2">{category.name} Tradition</h3>
                  <p className="text-white/90">
                    Discover the rich heritage and craftsmanship of {category.name} sarees, handwoven by skilled
                    artisans.
                  </p>
                  <Button className="mt-4 bg-white text-black hover:bg-white/90" asChild>
                    <Link href={`/categories/${category.slug}`}>Explore Collection</Link>
                  </Button>
                </div>
              </div>
            </div>

          {/* Features or Characteristics of this Category */}
            <div className="mt-12 grid md:grid-cols-3 gap-6">
              <div className="bg-background rounded-lg p-6 shadow-sm">
                <h4 className="font-medium mb-2">Unique Characteristics</h4>
                <p className="text-sm text-muted-foreground">
                  {category.name === "Banarasi Silk" &&
                    "Known for gold and silver zari work, intricate designs, and rich pallu."}
                  {category.name === "Kanjivaram" &&
                    "Recognized for contrasting borders, temple designs, and pure mulberry silk."}
                  {category.name === "Chanderi" &&
                    "Famous for lightweight texture, sheer quality, and traditional butis."}
                  {category.name === "Jamdani" &&
                    "Celebrated for hand-woven floral patterns, fine cotton texture, and geometric designs."}
                </p>
              </div>
              <div className="bg-background rounded-lg p-6 shadow-sm">
                <h4 className="font-medium mb-2">Weaving Technique</h4>
                <p className="text-sm text-muted-foreground">
                  {category.name === "Banarasi Silk" &&
                    "Woven on pit looms with intricate supplementary weft technique using gold and silver threads."}
                  {category.name === "Kanjivaram" &&
                    "Woven with pure mulberry silk and zari made from silver threads coated with gold."}
                  {category.name === "Chanderi" &&
                    "Woven with silk and cotton yarns, creating a shimmering texture with a lightweight feel."}
                  {category.name === "Jamdani" &&
                    "Hand-woven on traditional looms using a discontinuous weft technique for intricate patterns."}
                </p>
              </div>
              <div className="bg-background rounded-lg p-6 shadow-sm">
                <h4 className="font-medium mb-2">Occasions</h4>
                <p className="text-sm text-muted-foreground">
                  {category.name === "Banarasi Silk" &&
                    "Perfect for weddings, religious ceremonies, and special occasions."}
                  {category.name === "Kanjivaram" && "Ideal for weddings, festivals, and traditional ceremonies."}
                  {category.name === "Chanderi" && "Great for semi-formal events, festive occasions, and daily wear."}
                  {category.name === "Jamdani" &&
                    "Suitable for special occasions, cultural events, and elegant gatherings."}
                </p>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Additional Categories Section */}
      <section className="py-12">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-serif font-bold">Explore More Categories</h2>
            <p className="text-muted-foreground mt-2">
              Discover other exquisite handwoven traditions from across India
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories
              .filter((cat) => !featuredCategoryTypes.some((f) => f.slug === cat.slug))
              .slice(0, 6)
              .map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group relative overflow-hidden rounded-lg h-[180px]"
                >
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors z-10" />
                  <img
                    src={category.image_url || "/placeholder.svg?height=180&width=300"}
                    alt={category.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex flex-col justify-center items-center z-20 p-4 text-center">
                    <h3 className="text-lg font-medium text-white">{category.name}</h3>
                    <Button variant="outline" size="sm" className="mt-2 border-white text-white hover:bg-white/10">
                      Explore
                    </Button>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  )
}
