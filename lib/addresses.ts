import { sql } from "./db"

export type Address = {
  id?: number
  user_id: number
  address_line1: string
  address_line2?: string
  city: string
  state: string
  postal_code: string
  country: string
  is_default?: boolean
  created_at?: Date
  updated_at?: Date
}

export async function saveAddress(addressData: Omit<Address, "id" | "created_at" | "updated_at">) {
  try {
    console.log("💾 Saving address to database...")

    // If this is set as default, unset other default addresses for this user
    if (addressData.is_default) {
      await sql`
        UPDATE addresses 
        SET is_default = false 
        WHERE user_id = ${addressData.user_id}
      `
    }

    const result = await sql`
      INSERT INTO addresses (
        user_id,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country,
        is_default
      ) VALUES (
        ${addressData.user_id},
        ${addressData.address_line1},
        ${addressData.address_line2 || null},
        ${addressData.city},
        ${addressData.state},
        ${addressData.postal_code},
        ${addressData.country},
        ${addressData.is_default || false}
      ) RETURNING id
    `

    console.log("✅ Address saved with ID:", result[0].id)
    return result[0]
  } catch (error) {
    console.error("❌ Error saving address:", error)
    throw error
  }
}

export async function getUserAddresses(userId: number) {
  try {
    const addresses = await sql`
      SELECT * FROM addresses 
      WHERE user_id = ${userId}
      ORDER BY is_default DESC, created_at DESC
    `
    return addresses
  } catch (error) {
    console.error("Error fetching user addresses:", error)
    return []
  }
}

export async function getAddressById(addressId: number, userId: number) {
  try {
    const addresses = await sql`
      SELECT * FROM addresses 
      WHERE id = ${addressId} AND user_id = ${userId}
    `
    return addresses[0] || null
  } catch (error) {
    console.error("Error fetching address:", error)
    return null
  }
}

export async function updateAddress(addressId: number, userId: number, addressData: Partial<Address>) {
  try {
    // If this is set as default, unset other default addresses for this user
    if (addressData.is_default) {
      await sql`
        UPDATE addresses 
        SET is_default = false 
        WHERE user_id = ${userId} AND id != ${addressId}
      `
    }

    const result = await sql`
      UPDATE addresses 
      SET 
        address_line1 = COALESCE(${addressData.address_line1}, address_line1),
        address_line2 = COALESCE(${addressData.address_line2}, address_line2),
        city = COALESCE(${addressData.city}, city),
        state = COALESCE(${addressData.state}, state),
        postal_code = COALESCE(${addressData.postal_code}, postal_code),
        country = COALESCE(${addressData.country}, country),
        is_default = COALESCE(${addressData.is_default}, is_default),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${addressId} AND user_id = ${userId}
      RETURNING id
    `

    return result[0] || null
  } catch (error) {
    console.error("Error updating address:", error)
    throw error
  }
}

export async function deleteAddress(addressId: number, userId: number) {
  try {
    const result = await sql`
      DELETE FROM addresses 
      WHERE id = ${addressId} AND user_id = ${userId}
      RETURNING id
    `
    return result[0] || null
  } catch (error) {
    console.error("Error deleting address:", error)
    throw error
  }
}
