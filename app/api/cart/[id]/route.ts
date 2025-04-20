import { NextResponse } from "next/server"
import { removeFromCart, updateCartItem } from "@/lib/cart"
import { getCurrentUser } from "@/lib/auth"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const cartItemId = Number.parseInt(params.id)
    if (isNaN(cartItemId)) {
      return NextResponse.json({ message: "Invalid cart item ID" }, { status: 400 })
    }

    const { quantity } = await request.json()

    if (quantity === undefined || quantity < 0) {
      return NextResponse.json({ message: "Invalid quantity" }, { status: 400 })
    }

    const cart = await updateCartItem(cartItemId, quantity)
    return NextResponse.json(cart)
  } catch (error: any) {
    console.error("Error updating cart item:", error)
    return NextResponse.json({ message: error.message || "Failed to update cart item" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const cartItemId = Number.parseInt(params.id)
    if (isNaN(cartItemId)) {
      return NextResponse.json({ message: "Invalid cart item ID" }, { status: 400 })
    }

    const cart = await removeFromCart(cartItemId)
    return NextResponse.json(cart)
  } catch (error: any) {
    console.error("Error removing cart item:", error)
    return NextResponse.json({ message: error.message || "Failed to remove cart item" }, { status: 500 })
  }
}
