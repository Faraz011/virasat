import { NextResponse } from "next/server"
import { addToCart, clearCart, getCart } from "@/lib/cart"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      // Return empty cart for unauthenticated users instead of an error
      return NextResponse.json([])
    }

    const cart = await getCart()
    return NextResponse.json(cart)
  } catch (error) {
    console.error("Error fetching cart:", error)
    return NextResponse.json({ message: "Failed to fetch cart" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { productId, quantity } = await request.json()

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json({ message: "Invalid request data" }, { status: 400 })
    }

    const cart = await addToCart(productId, quantity)
    return NextResponse.json(cart)
  } catch (error: any) {
    console.error("Error adding to cart:", error)
    return NextResponse.json({ message: error.message || "Failed to add to cart" }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await clearCart()
    return NextResponse.json([])
  } catch (error) {
    console.error("Error clearing cart:", error)
    return NextResponse.json({ message: "Failed to clear cart" }, { status: 500 })
  }
}
