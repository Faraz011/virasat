import { sql } from "./db"

export type Product = {
  id: number
  name: string
  slug: string
  description: string
  price: number
  original_price: number | null
  category_id: number
  stock_quantity: number
  image_url: string
  is_featured: boolean
  is_new: boolean
  is_sale: boolean
  rating: number
  review_count: number
  material: string
  weave_type: string
  color: string
  category_name?: string
  category_slug?: string
}

export type Category = {
  id: number
  name: string
  slug: string
  description: string | null
  region: string | null
  image_url: string | null
}

export async function getCategories(): Promise<Category[]> {
  return await sql`SELECT * FROM categories ORDER BY name`
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return await sql`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_featured = true
    ORDER BY p.created_at DESC
    LIMIT ${limit}
  `
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  return await sql`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_new = true
    ORDER BY p.created_at DESC
    LIMIT ${limit}
  `
}

export async function getSaleProducts(limit = 8): Promise<Product[]> {
  return await sql`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_sale = true
    ORDER BY p.created_at DESC
    LIMIT ${limit}
  `
}

export async function getProductsByCategory(categorySlug: string, limit = 20, offset = 0): Promise<Product[]> {
  return await sql`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE c.slug = ${categorySlug}
    ORDER BY p.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await sql`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.slug = ${slug}
  `

  return products[0] || null
}

export async function getProductImages(productId: number) {
  return await sql`
    SELECT * FROM product_images
    WHERE product_id = ${productId}
    ORDER BY is_primary DESC, display_order ASC
  `
}

export async function searchProducts(query: string, limit = 20): Promise<Product[]> {
  const searchTerm = `%${query}%`

  return await sql`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 
      p.name ILIKE ${searchTerm} OR
      p.description ILIKE ${searchTerm} OR
      p.material ILIKE ${searchTerm} OR
      p.weave_type ILIKE ${searchTerm} OR
      p.color ILIKE ${searchTerm} OR
      c.name ILIKE ${searchTerm}
    ORDER BY p.created_at DESC
    LIMIT ${limit}
  `
}

// Add a function to add product images

export async function addProductImage(productId: number, imageUrl: string, isPrimary = false) {
  return await sql`
    INSERT INTO product_images (product_id, image_url, is_primary, display_order)
    VALUES (${productId}, ${imageUrl}, ${isPrimary}, 
      (SELECT COALESCE(MAX(display_order), 0) + 1 FROM product_images WHERE product_id = ${productId})
    )
    RETURNING *
  `
}

// Add a function to update product image
export async function updateProductImage(imageId: number, isPrimary = false) {
  // If setting as primary, unset any existing primary images
  if (isPrimary) {
    await sql`
      UPDATE product_images
      SET is_primary = false
      WHERE id IN (
        SELECT id FROM product_images 
        WHERE product_id = (SELECT product_id FROM product_images WHERE id = ${imageId})
      )
    `
  }

  return await sql`
    UPDATE product_images
    SET is_primary = ${isPrimary}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${imageId}
    RETURNING *
  `
}

// Add a function to delete product image
export async function deleteProductImage(imageId: number) {
  return await sql`
    DELETE FROM product_images
    WHERE id = ${imageId}
  `
}
