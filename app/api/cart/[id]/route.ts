import { NextResponse } from "next/server"
import { updateCartItem, removeCartItem } from "@/lib/cart"
import { getCurrentUser } from "@/lib/auth"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { quantity } = await request.json()
    const itemId = Number.parseInt(params.id)

    if (!itemId || !quantity || quantity < 1) {
      return NextResponse.json({ message: "Invalid request data" }, { status: 400 })
    }

    const cart = await updateCartItem(itemId, quantity)
    return NextResponse.json(cart)
  } catch (error: any) {
    console.error("Error updating cart item:", error)

    // Handle specific stock-related errors
    if (error.message.includes("out of stock") || error.message.includes("insufficient stock")) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: error.message || "Failed to update cart item" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const itemId = Number.parseInt(params.id)

    if (!itemId) {
      return NextResponse.json({ message: "Invalid item ID" }, { status: 400 })
    }

    const cart = await removeCartItem(itemId)
    return NextResponse.json(cart)
  } catch (error: any) {
    console.error("Error removing cart item:", error)
    return NextResponse.json({ message: error.message || "Failed to remove cart item" }, { status: 500 })
  }
}
