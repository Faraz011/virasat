import { Suspense } from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { getFeaturedProducts } from "@/lib/products"
import { ProductCard } from "@/components/product-card"
import { ProductsLoading } from "@/components/products-loading"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Featured Products - Virasat",
  description: "Explore our featured collection of handwoven sarees",
}

export default async function FeaturedProductsPage() {
  const products = await getFeaturedProducts(20) // Get more products for the dedicated page

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-2 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link href="/shop">
              <ChevronLeft className="h-4 w-4" />
              Back to Shop
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Featured Products</h1>
        <p className="text-muted-foreground max-w-3xl">
          Our handpicked selection of exceptional handwoven sarees, showcasing the finest craftsmanship and designs.
        </p>
      </div>

      <Suspense fallback={<ProductsLoading count={12} />}>
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No featured products found. Check back soon for updates.</p>
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
  )
}
