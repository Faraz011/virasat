import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { addProductImage, deleteProductImage, updateProductImage } from "@/lib/products"

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

    const images = await sql`
      SELECT * FROM product_images 
      WHERE product_id = ${productId}
      ORDER BY is_primary DESC, display_order ASC
    `

    return NextResponse.json(images)
  } catch (error) {
    console.error("Error fetching product images:", error)
    return NextResponse.json({ message: "Failed to fetch product images" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user?.is_admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const productId = Number.parseInt(params.id, 10)
    if (isNaN(productId)) {
      return NextResponse.json({ message: "Invalid product ID" }, { status: 400 })
    }

    const { imageUrl, isPrimary } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ message: "Image URL is required" }, { status: 400 })
    }

    const result = await addProductImage(productId, imageUrl, isPrimary)

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error adding product image:", error)
    return NextResponse.json({ message: "Failed to add product image" }, { status: 500 })
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

    const { imageId, isPrimary } = await request.json()

    if (!imageId) {
      return NextResponse.json({ message: "Image ID is required" }, { status: 400 })
    }

    const result = await updateProductImage(imageId, isPrimary)

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating product image:", error)
    return NextResponse.json({ message: "Failed to update product image" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user?.is_admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const imageId = url.searchParams.get("imageId")

    if (!imageId) {
      return NextResponse.json({ message: "Image ID is required" }, { status: 400 })
    }

    await deleteProductImage(Number.parseInt(imageId, 10))

    return NextResponse.json({ message: "Product image deleted successfully" })
  } catch (error) {
    console.error("Error deleting product image:", error)
    return NextResponse.json({ message: "Failed to delete product image" }, { status: 500 })
  }
}
