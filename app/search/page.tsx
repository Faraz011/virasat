import { Suspense } from "react"
import { searchProducts } from "@/lib/products"
import { ProductCard } from "@/components/product-card"
import { ProductsLoading } from "@/components/products-loading"

export const metadata = {
  title: "Search Results - Virasat",
  description: "Search results for handwoven sarees",
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q: string }
}) {
  const query = searchParams.q || ""
  const products = query ? await searchProducts(query) : []

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-serif font-bold tracking-tight">Search Results</h1>
        <p className="text-muted-foreground">
          {query ? (
            <>
              Showing results for <span className="font-medium">"{query}"</span>
            </>
          ) : (
            "Please enter a search term"
          )}
        </p>
      </div>

      {!query ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Enter a search term to find products</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found matching "{query}"</p>
        </div>
      ) : (
        <Suspense fallback={<ProductsLoading count={8} />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Suspense>
      )}
    </div>
  )
}
