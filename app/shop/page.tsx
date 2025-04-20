import { Suspense } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getCategories, getFeaturedProducts, getNewArrivals, getSaleProducts } from "@/lib/products"
import { ProductCard } from "@/components/product-card"
import { ProductsLoading } from "@/components/products-loading"

export const metadata = {
  title: "Shop - Virasat Handwoven Sarees",
  description: "Explore our collection of authentic handwoven sarees from across India",
}

export default async function ShopPage() {
  const [categories, featuredProducts, newArrivals, saleProducts] = await Promise.all([
    getCategories(),
    getFeaturedProducts(4),
    getNewArrivals(4),
    getSaleProducts(4),
  ])

  return (
    <div className="container py-8 space-y-12">
      <section>
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-3xl font-serif font-bold tracking-tight">Shop Our Collection</h1>
          <p className="text-muted-foreground max-w-3xl">
            Discover authentic handwoven sarees crafted by master artisans across India. Each piece tells a unique story
            of tradition and craftsmanship.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => (
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
                  <p className="text-sm text-white/80">{category.region}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif font-bold">Featured Products</h2>
          <Link href="/shop/featured" className="text-sm font-medium flex items-center gap-1 hover:underline">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <Suspense fallback={<ProductsLoading count={4} />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Suspense>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif font-bold">New Arrivals</h2>
          <Link href="/shop/new-arrivals" className="text-sm font-medium flex items-center gap-1 hover:underline">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <Suspense fallback={<ProductsLoading count={4} />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Suspense>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif font-bold">Sale Items</h2>
          <Link href="/shop/sale" className="text-sm font-medium flex items-center gap-1 hover:underline">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <Suspense fallback={<ProductsLoading count={4} />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {saleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Suspense>
      </section>
    </div>
  )
}
