import { sql } from "./db"
import { getCurrentUser } from "./auth"

export type OrderStatus =
  | "pending"
  | "processing"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "failed"
  | "refunded"

export type OrderItem = {
  product_id: number
  quantity: number
  price: number
  name: string
}

export type ShippingAddress = {
  firstName: string
  lastName: string
  address: string
  city: string
  state: string
  postalCode: string
  phone: string
}

export type OrderData = {
  userId: number
  total: number // Changed from amount to total
  items: OrderItem[]
  shippingAddress: ShippingAddress
  paymentMethod: string
  paymentStatus: string
  razorpayOrderId?: string
}

export async function createOrder(orderData: OrderData) {
  try {
    // Insert the order - using total instead of amount
    const orderResult = await sql`
      INSERT INTO orders (
        user_id, total, payment_method, payment_status, 
        shipping_address, razorpay_order_id, status
      ) VALUES (
        ${orderData.userId}, ${orderData.total}, ${orderData.paymentMethod}, 
        ${orderData.paymentStatus}, ${JSON.stringify(orderData.shippingAddress)}, 
        ${orderData.razorpayOrderId || null}, 'pending'
      ) RETURNING id
    `

    const orderId = orderResult[0].id

    // Insert order items
    for (const item of orderData.items) {
      await sql`
        INSERT INTO order_items (
          order_id, product_id, quantity, price, name
        ) VALUES (
          ${orderId}, ${item.product_id}, ${item.quantity}, ${item.price}, ${item.name}
        )
      `

      // Update product stock
      await sql`
        UPDATE products 
        SET stock_quantity = stock_quantity - ${item.quantity} 
        WHERE id = ${item.product_id}
      `
    }

    // Get the complete order
    const orders = await sql`
      SELECT * FROM orders WHERE id = ${orderId}
    `

    return orders[0]
  } catch (error) {
    console.error("Error creating order:", error)
    throw error
  }
}

export async function getOrderById(orderId: number) {
  try {
    const orders = await sql`
      SELECT * FROM orders WHERE id = ${orderId}
    `

    if (orders.length === 0) {
      return null
    }

    const order = orders[0]

    // Get order items
    const items = await sql`
      SELECT * FROM order_items WHERE order_id = ${orderId}
    `

    return {
      ...order,
      items,
    }
  } catch (error) {
    console.error("Error getting order:", error)
    return null
  }
}

export async function getUserOrders(userId?: number) {
  try {
    if (!userId) {
      const user = await getCurrentUser()
      if (!user) return []
      userId = user.id
    }

    const orders = await sql`
      SELECT * FROM orders 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `

    // Get items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await sql`
          SELECT * FROM order_items WHERE order_id = ${order.id}
        `
        return {
          ...order,
          items,
        }
      }),
    )

    return ordersWithItems
  } catch (error) {
    console.error("Error getting user orders:", error)
    return []
  }
}

export async function updateOrderStatus(orderId: number, status: OrderStatus, additionalData: any = {}) {
  try {
    // Update the order status
    await sql`
      UPDATE orders 
      SET 
        status = ${status}, 
        payment_status = CASE 
          WHEN ${status} = 'paid' THEN 'paid'
          WHEN ${status} = 'refunded' THEN 'refunded'
          WHEN ${status} = 'failed' THEN 'failed'
          ELSE payment_status
        END,
        metadata = COALESCE(metadata, '{}'::jsonb) || ${JSON.stringify(additionalData)}::jsonb,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${orderId}
    `

    return getOrderById(orderId)
  } catch (error) {
    console.error("Error updating order status:", error)
    throw error
  }
}
