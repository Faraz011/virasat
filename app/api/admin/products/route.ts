import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user?.is_admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const products = await sql`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ message: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user?.is_admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Check if slug already exists
    const existingProduct = await sql`SELECT id FROM products WHERE slug = ${data.slug}`
    if (existingProduct.length > 0) {
      return NextResponse.json({ message: "A product with this slug already exists" }, { status: 409 })
    }

    // Insert new product
    const result = await sql`
      INSERT INTO products (
        name, slug, description, price, original_price, category_id, 
        stock_quantity, sku, image_url, is_featured, is_new, is_sale, 
        material, weave_type, color
      ) VALUES (
        ${data.name}, ${data.slug}, ${data.description}, ${data.price}, 
        ${data.original_price}, ${data.category_id}, ${data.stock_quantity}, 
        ${data.sku}, ${data.image_url}, ${data.is_featured}, 
        ${data.is_new}, ${data.is_sale}, ${data.material}, 
        ${data.weave_type}, ${data.color}
      )
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ message: "Failed to create product" }, { status: 500 })
  }
}
