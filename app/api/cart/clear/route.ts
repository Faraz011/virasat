import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { clearCart } from "@/lib/cart"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await clearCart(user.id)

    return NextResponse.json({ message: "Cart cleared successfully" })
  } catch (error: any) {
    console.error("Error clearing cart:", error)
    return NextResponse.json({ message: "Failed to clear cart" }, { status: 500 })
  }
}
