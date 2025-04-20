import { sql } from "./db"
import { getCurrentUser } from "./auth"

export type CartItem = {
  id: number
  product_id: number
  quantity: number
  name: string
  price: number
  original_price: number | null
  image_url: string
  slug: string
}

export async function getCart(): Promise<CartItem[]> {
  const user = await getCurrentUser()

  if (!user) return []

  return await sql`
    SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price, p.original_price, p.image_url, p.slug
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ${user.id}
  `
}

export async function addToCart(productId: number, quantity = 1) {
  const user = await getCurrentUser()

  if (!user) throw new Error("You must be logged in to add items to cart")

  // Check if product exists and has enough stock
  const product = await sql`SELECT id, stock_quantity FROM products WHERE id = ${productId}`

  if (!product[0]) throw new Error("Product not found")
  if (product[0].stock_quantity < quantity) throw new Error("Not enough stock available")

  // Check if item already exists in cart
  const existingItem = await sql`
    SELECT id, quantity FROM cart_items WHERE user_id = ${user.id} AND product_id = ${productId}
  `

  if (existingItem[0]) {
    // Update quantity if item exists
    const newQuantity = existingItem[0].quantity + quantity

    if (newQuantity > product[0].stock_quantity) {
      throw new Error("Not enough stock available")
    }

    await sql`
      UPDATE cart_items 
      SET quantity = ${newQuantity}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${existingItem[0].id}
    `
  } else {
    // Add new item to cart
    await sql`
      INSERT INTO cart_items (user_id, product_id, quantity) 
      VALUES (${user.id}, ${productId}, ${quantity})
    `
  }

  return getCart()
}

export async function updateCartItem(cartItemId: number, quantity: number) {
  const user = await getCurrentUser()

  if (!user) throw new Error("You must be logged in to update cart")

  // Get cart item and check ownership
  const cartItem = await sql`
    SELECT ci.id, ci.product_id, p.stock_quantity 
    FROM cart_items ci 
    JOIN products p ON ci.product_id = p.id 
    WHERE ci.id = ${cartItemId} AND ci.user_id = ${user.id}
  `

  if (!cartItem[0]) throw new Error("Cart item not found")

  // Check stock
  if (quantity > cartItem[0].stock_quantity) {
    throw new Error("Not enough stock available")
  }

  if (quantity <= 0) {
    // Remove item if quantity is 0 or negative
    await sql`DELETE FROM cart_items WHERE id = ${cartItemId}`
  } else {
    // Update quantity
    await sql`
      UPDATE cart_items 
      SET quantity = ${quantity}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${cartItemId}
    `
  }

  return getCart()
}

export async function removeFromCart(cartItemId: number) {
  const user = await getCurrentUser()

  if (!user) throw new Error("You must be logged in to remove items from cart")

  await sql`DELETE FROM cart_items WHERE id = ${cartItemId} AND user_id = ${user.id}`

  return getCart()
}

export async function clearCart() {
  const user = await getCurrentUser()

  if (!user) throw new Error("You must be logged in to clear cart")

  await sql`DELETE FROM cart_items WHERE user_id = ${user.id}`

  return []
}
