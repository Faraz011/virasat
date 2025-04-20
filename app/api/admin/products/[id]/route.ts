import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user?.is_admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const productId = Number.parseInt(params.id, 10)
    if (isNaN(productId)) {
      return NextResponse.json({ message: "Invalid product ID" }, { status: 400 })
    }

    const products = await sql`SELECT * FROM products WHERE id = ${productId}`
    const product = products[0]

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ message: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user?.is_admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const productId = Number.parseInt(params.id, 10)
    if (isNaN(productId)) {
      return NextResponse.json({ message: "Invalid product ID" }, { status: 400 })
    }

    const data = await request.json()

    // Check if product exists
    const existingProducts = await sql`SELECT id FROM products WHERE id = ${productId}`
    if (existingProducts.length === 0) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    // Check if slug is unique (except for this product)
    const slugCheck = await sql`
      SELECT id FROM products WHERE slug = ${data.slug} AND id != ${productId}
    `
    if (slugCheck.length > 0) {
      return NextResponse.json({ message: "A product with this slug already exists" }, { status: 409 })
    }

    // Update product
    const result = await sql`
      UPDATE products SET
        name = ${data.name},
        slug = ${data.slug},
        description = ${data.description},
        price = ${data.price},
        original_price = ${data.original_price},
        category_id = ${data.category_id},
        stock_quantity = ${data.stock_quantity},
        sku = ${data.sku},
        image_url = ${data.image_url},
        is_featured = ${data.is_featured},
        is_new = ${data.is_new},
        is_sale = ${data.is_sale},
        material = ${data.material},
        weave_type = ${data.weave_type},
        color = ${data.color},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${productId}
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ message: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user?.is_admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const productId = Number.parseInt(params.id, 10)
    if (isNaN(productId)) {
      return NextResponse.json({ message: "Invalid product ID" }, { status: 400 })
    }

    // Check if product exists
    const existingProducts = await sql`SELECT id FROM products WHERE id = ${productId}`
    if (existingProducts.length === 0) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    // Delete product
    await sql`DELETE FROM products WHERE id = ${productId}`

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ message: "Failed to delete product" }, { status: 500 })
  }
}
