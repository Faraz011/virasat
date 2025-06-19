import { sql } from "./db"
import { getCurrentUser } from "./auth"
import { saveAddress } from "./addresses"

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
  id?: number
  product_id: number
  quantity: number
  price: number
  name: string
  image_url?: string
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
  total: number
  items: OrderItem[]
  shippingAddress: ShippingAddress
  paymentMethod: string
  paymentStatus: string
  razorpayOrderId?: string
  razorpayPaymentId?: string
}

export async function createOrder(orderData: OrderData) {
  try {
    console.log("📦 Creating order in database...")

    // Generate a unique order number for customer reference
    const orderNumber = `VIR${Date.now()}${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`

    // Insert the order
    const orderResult = await sql`
      INSERT INTO orders (
        user_id, order_number, total, payment_method, payment_status, 
        shipping_address, razorpay_order_id, razorpay_payment_id, status
      ) VALUES (
        ${orderData.userId}, ${orderNumber}, ${orderData.total}, ${orderData.paymentMethod}, 
        ${orderData.paymentStatus}, ${JSON.stringify(orderData.shippingAddress)}, 
        ${orderData.razorpayOrderId || null}, ${orderData.razorpayPaymentId || null}, 'pending'
      ) RETURNING id, order_number
    `

    const orderId = orderResult[0].id
    const generatedOrderNumber = orderResult[0].order_number

    console.log("✅ Order created:", { orderId, orderNumber: generatedOrderNumber })

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

    // Save shipping address to addresses table
    try {
      console.log("📍 Saving shipping address...")
      await saveAddress({
        user_id: orderData.userId,
        type: "shipping",
        first_name: orderData.shippingAddress.firstName,
        last_name: orderData.shippingAddress.lastName,
        address_line_1: orderData.shippingAddress.address,
        city: orderData.shippingAddress.city,
        state: orderData.shippingAddress.state,
        postal_code: orderData.shippingAddress.postalCode,
        country: "India", // Default to India
        phone: orderData.shippingAddress.phone,
        is_default: false, // Don't set as default automatically
      })
      console.log("✅ Shipping address saved")
    } catch (addressError) {
      console.warn("⚠️ Failed to save address (non-critical):", addressError)
      // Don't fail the order creation if address saving fails
    }

    // Get the complete order with items
    const completeOrder = await getOrderById(orderId)

    return {
      ...completeOrder,
      orderNumber: generatedOrderNumber,
    }
  } catch (error) {
    console.error("❌ Error creating order:", error)
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

    // Get order items with product details
    const items = await sql`
      SELECT 
        oi.*,
        p.image_url,
        p.slug
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ${orderId}
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
          SELECT 
            oi.*,
            p.image_url,
            p.slug
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = ${order.id}
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

export async function cancelOrder(orderId: number, userId: number) {
  try {
    // Check if order belongs to user and can be cancelled
    const order = await getOrderById(orderId)

    if (!order || order.user_id !== userId) {
      throw new Error("Order not found or unauthorized")
    }

    if (!["pending", "processing"].includes(order.status)) {
      throw new Error("Order cannot be cancelled")
    }

    // Update order status to cancelled
    await updateOrderStatus(orderId, "cancelled")

    // Restore product stock
    for (const item of order.items) {
      await sql`
        UPDATE products 
        SET stock_quantity = stock_quantity + ${item.quantity} 
        WHERE id = ${item.product_id}
      `
    }

    return { success: true, message: "Order cancelled successfully" }
  } catch (error) {
    console.error("Error cancelling order:", error)
    throw error
  }
}

export async function reorderItems(orderId: number, userId: number) {
  try {
    const order = await getOrderById(orderId)

    if (!order || order.user_id !== userId) {
      throw new Error("Order not found or unauthorized")
    }

    // Add items back to cart
    for (const item of order.items) {
      // Check if product still exists and has stock
      const product = await sql`
        SELECT * FROM products WHERE id = ${item.product_id} AND stock_quantity > 0
      `

      if (product.length > 0) {
        // Add to cart or update existing cart item
        await sql`
          INSERT INTO cart_items (user_id, product_id, quantity)
          VALUES (${userId}, ${item.product_id}, ${item.quantity})
          ON CONFLICT (user_id, product_id)
          DO UPDATE SET quantity = cart_items.quantity + ${item.quantity}
        `
      }
    }

    return { success: true, message: "Items added to cart successfully" }
  } catch (error) {
    console.error("Error reordering items:", error)
    throw error
  }
}

export function getOrderStatusColor(status: OrderStatus): string {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    paid: "bg-green-100 text-green-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800",
  }
  return colors[status] || "bg-gray-100 text-gray-800"
}

export function canCancelOrder(status: OrderStatus): boolean {
  return ["pending", "processing"].includes(status)
}

export function canReorder(status: OrderStatus): boolean {
  return ["delivered", "cancelled"].includes(status)
}
