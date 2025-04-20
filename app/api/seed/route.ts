import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

// Sample categories data
const categories = [
  {
    name: "Banarasi Silk",
    slug: "banarasi-silk",
    description: "Luxurious silk sarees from Varanasi known for their gold and silver brocade or zari work.",
    region: "Varanasi, Uttar Pradesh",
    image_url: "/placeholder.svg?height=400&width=600",
  },
  {
    name: "Kanjivaram",
    slug: "kanjivaram",
    description: "Traditional silk sarees from Kanchipuram, Tamil Nadu, known for their durability and vibrant colors.",
    region: "Kanchipuram, Tamil Nadu",
    image_url: "/placeholder.svg?height=400&width=600",
  },
  {
    name: "Chanderi",
    slug: "chanderi",
    description: "Lightweight sarees with a sheer texture, featuring traditional motifs and zari borders.",
    region: "Chanderi, Madhya Pradesh",
    image_url: "/placeholder.svg?height=400&width=600",
  },
  {
    name: "Jamdani",
    slug: "jamdani",
    description: "Fine muslin sarees with intricate hand-woven floral or geometric patterns.",
    region: "West Bengal",
    image_url: "/placeholder.svg?height=400&width=600",
  },
]

// Sample products data
const products = [
  {
    name: "Royal Banarasi Silk Saree",
    slug: "royal-banarasi-silk-saree",
    description:
      "This exquisite Banarasi silk saree features intricate gold zari work with traditional motifs. The rich maroon color and contrasting gold border make it perfect for weddings and special occasions.",
    price: 18500,
    original_price: 22000,
    category_slug: "banarasi-silk",
    stock_quantity: 10,
    sku: "BNR001",
    image_url: "/placeholder.svg?height=600&width=450",
    is_featured: true,
    is_new: false,
    is_sale: true,
    rating: 4.8,
    review_count: 28,
    material: "Pure Silk",
    weave_type: "Brocade",
    color: "Maroon",
  },
  {
    name: "Peacock Motif Kanjivaram",
    slug: "peacock-motif-kanjivaram",
    description:
      "A stunning Kanjivaram silk saree featuring intricate peacock motifs woven in gold zari. The rich teal color symbolizes elegance and royalty, making it a perfect choice for weddings and festive occasions.",
    price: 24999,
    original_price: null,
    category_slug: "kanjivaram",
    stock_quantity: 5,
    sku: "KNJ001",
    image_url: "/placeholder.svg?height=600&width=450",
    is_featured: true,
    is_new: true,
    is_sale: false,
    rating: 5.0,
    review_count: 16,
    material: "Pure Silk",
    weave_type: "Traditional",
    color: "Teal",
  },
  {
    name: "Pastel Chanderi Cotton Silk",
    slug: "pastel-chanderi-cotton-silk",
    description:
      "A lightweight Chanderi cotton-silk blend saree in a soothing pastel pink shade. Features delicate silver zari borders and small buttas scattered throughout. Perfect for summer events and casual gatherings.",
    price: 6999,
    original_price: 8500,
    category_slug: "chanderi",
    stock_quantity: 15,
    sku: "CHN001",
    image_url: "/placeholder.svg?height=600&width=450",
    is_featured: true,
    is_new: false,
    is_sale: true,
    rating: 4.5,
    review_count: 42,
    material: "Cotton Silk Blend",
    weave_type: "Chanderi",
    color: "Pastel Pink",
  },
  {
    name: "Floral Jamdani Handloom",
    slug: "floral-jamdani-handloom",
    description:
      "A masterpiece of Bengali weaving tradition, this Jamdani saree features intricate hand-woven floral patterns throughout. The lightweight muslin fabric makes it comfortable for all-day wear.",
    price: 12500,
    original_price: null,
    category_slug: "jamdani",
    stock_quantity: 8,
    sku: "JMD001",
    image_url: "/placeholder.svg?height=600&width=450",
    is_featured: true,
    is_new: false,
    is_sale: false,
    rating: 4.7,
    review_count: 35,
    material: "Fine Cotton",
    weave_type: "Jamdani",
    color: "Off-white",
  },
  {
    name: "Emerald Green Banarasi Silk",
    slug: "emerald-green-banarasi-silk",
    description:
      "A stunning emerald green Banarasi silk saree with intricate gold zari work. The rich color and traditional motifs make it a timeless addition to your collection.",
    price: 19999,
    original_price: null,
    category_slug: "banarasi-silk",
    stock_quantity: 7,
    sku: "BNR002",
    image_url: "/placeholder.svg?height=600&width=450",
    is_featured: false,
    is_new: true,
    is_sale: false,
    rating: 4.9,
    review_count: 18,
    material: "Pure Silk",
    weave_type: "Brocade",
    color: "Emerald Green",
  },
  {
    name: "Bridal Red Kanjivaram",
    slug: "bridal-red-kanjivaram",
    description:
      "A traditional bridal Kanjivaram saree in auspicious red with heavy gold zari work. The intricate temple border and rich pallu make it perfect for wedding ceremonies.",
    price: 32000,
    original_price: 35000,
    category_slug: "kanjivaram",
    stock_quantity: 3,
    sku: "KNJ002",
    image_url: "/placeholder.svg?height=600&width=450",
    is_featured: false,
    is_new: false,
    is_sale: true,
    rating: 5.0,
    review_count: 12,
    material: "Pure Silk",
    weave_type: "Traditional",
    color: "Bridal Red",
  },
  {
    name: "Blue Chanderi with Silver Zari",
    slug: "blue-chanderi-with-silver-zari",
    description:
      "A beautiful sky blue Chanderi saree with delicate silver zari borders. The lightweight fabric and subtle sheen make it perfect for daytime events.",
    price: 7500,
    original_price: null,
    category_slug: "chanderi",
    stock_quantity: 12,
    sku: "CHN002",
    image_url: "/placeholder.svg?height=600&width=450",
    is_featured: false,
    is_new: true,
    is_sale: false,
    rating: 4.6,
    review_count: 24,
    material: "Chanderi Silk Cotton",
    weave_type: "Chanderi",
    color: "Sky Blue",
  },
  {
    name: "Black Jamdani with Red Motifs",
    slug: "black-jamdani-with-red-motifs",
    description:
      "A striking black Jamdani saree with hand-woven red floral motifs. The contrast of colors creates a dramatic look perfect for evening events.",
    price: 14500,
    original_price: 16000,
    category_slug: "jamdani",
    stock_quantity: 6,
    sku: "JMD002",
    image_url: "/placeholder.svg?height=600&width=450",
    is_featured: false,
    is_new: false,
    is_sale: true,
    rating: 4.8,
    review_count: 19,
    material: "Fine Cotton",
    weave_type: "Jamdani",
    color: "Black",
  },
]

export async function GET() {
  try {
    const user = await getCurrentUser()

    // Only allow admin users to seed the database
    if (!user?.is_admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Insert categories
    for (const category of categories) {
      // Check if category already exists
      const existingCategory = await sql`SELECT id FROM categories WHERE slug = ${category.slug}`

      if (existingCategory.length === 0) {
        await sql`
          INSERT INTO categories (name, slug, description, region, image_url) 
          VALUES (${category.name}, ${category.slug}, ${category.description}, ${category.region}, ${category.image_url})
        `
      }
    }

    // Insert products
    for (const product of products) {
      // Get category ID
      const categoryResult = await sql`SELECT id FROM categories WHERE slug = ${product.category_slug}`

      if (categoryResult.length === 0) {
        continue // Skip if category doesn't exist
      }

      const categoryId = categoryResult[0].id

      // Check if product already exists
      const existingProduct = await sql`SELECT id FROM products WHERE slug = ${product.slug}`

      if (existingProduct.length === 0) {
        await sql`
          INSERT INTO products (
            name, slug, description, price, original_price, category_id, 
            stock_quantity, sku, image_url, is_featured, is_new, is_sale, 
            rating, review_count, material, weave_type, color
          ) VALUES (
            ${product.name}, ${product.slug}, ${product.description}, ${product.price}, 
            ${product.original_price}, ${categoryId}, ${product.stock_quantity}, 
            ${product.sku}, ${product.image_url}, ${product.is_featured}, 
            ${product.is_new}, ${product.is_sale}, ${product.rating}, 
            ${product.review_count}, ${product.material}, ${product.weave_type}, ${product.color}
          )
        `
      }
    }

    return NextResponse.json({ message: "Database seeded successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ message: "Failed to seed database" }, { status: 500 })
  }
}
