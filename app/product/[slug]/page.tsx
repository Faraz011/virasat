import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Star } from "lucide-react"

import { getProductBySlug, getProductImages } from "@/lib/products"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { Skeleton } from "@/components/ui/skeleton"

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug)

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found",
    }
  }

  return {
    title: `${product.name} - Virasat Handwoven Sarees`,
    description: product.description,
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug)

  if (!product) {
    notFound()
  }

  const productImages = await getProductImages(product.id)

  return (
    <div className="container py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg">
            <img
              src={product.image_url || "/placeholder.svg?height=600&width=600"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {productImages.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {productImages.map((image) => (
                <div key={image.id} className="aspect-square overflow-hidden rounded-lg">
                  <img
                    src={image.image_url || "/placeholder.svg?height=150&width=150"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground">{product.category_name}</p>
            <h1 className="text-3xl font-serif font-bold mt-1">{product.name}</h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${i < product.rating ? "fill-primary text-primary" : "fill-muted text-muted"}`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">({product.review_count} reviews)</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold">₹{product.price.toLocaleString("en-IN")}</span>
            {product.original_price && (
              <span className="text-lg text-muted-foreground line-through">
                ₹{product.original_price.toLocaleString("en-IN")}
              </span>
            )}
            {product.original_price && (
              <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
              </span>
            )}
          </div>

          <div className="border-t border-b py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Material</p>
                <p className="text-muted-foreground">{product.material || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Weave Type</p>
                <p className="text-muted-foreground">{product.weave_type || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Color</p>
                <p className="text-muted-foreground">{product.color || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Stock</p>
                <p className={product.stock_quantity > 0 ? "text-green-600" : "text-red-600"}>
                  {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Suspense fallback={<Skeleton className="h-10 w-full" />}>
              <AddToCartButton product={product} />
            </Suspense>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Description</h3>
            <div className="prose prose-sm max-w-none">
              <p>{product.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
