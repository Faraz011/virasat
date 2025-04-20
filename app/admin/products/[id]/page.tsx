import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { ProductForm } from "@/components/product-form"

export const metadata = {
  title: "Edit Product - Admin Dashboard",
  description: "Edit product details",
}

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()

  // Check if user is admin
  if (!user?.is_admin) {
    redirect("/login")
  }

  // Check if we're creating a new product
  const isNewProduct = params.id === "new"

  // Fetch product data if editing
  let product = null
  if (!isNewProduct) {
    const products = await sql`
      SELECT * FROM products WHERE id = ${Number.parseInt(params.id, 10)}
    `
    product = products[0]

    if (!product) {
      notFound()
    }
  }

  // Fetch categories for the form
  const categories = await sql`SELECT id, name FROM categories ORDER BY name`

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">
            {isNewProduct ? "Add New Product" : "Edit Product"}
          </h1>
          <p className="text-muted-foreground">
            {isNewProduct ? "Add a new product to your catalog" : `Editing ${product?.name || "product"}`}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/products">Back to Products</Link>
        </Button>
      </div>

      <ProductForm product={product} categories={categories} />
    </div>
  )
}
