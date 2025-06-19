import { sql } from "./db"

export type Address = {
  id?: number
  user_id: number
  first_name: string
  last_name: string
  address_line_1: string
  address_line_2?: string
  city: string
  state: string
  postal_code: string
  country: string
  phone?: string
  created_at?: Date
  updated_at?: Date
}

export async function saveAddress(addressData: Omit<Address, "id" | "created_at" | "updated_at">) {
  try {
    const result = await sql`
      INSERT INTO addresses (
        user_id,
        first_name,
        last_name,
        address_line_1,
        address_line_2,
        city,
        state,
        postal_code,
        country,
        phone
      ) VALUES (
        ${addressData.user_id},
        ${addressData.first_name},
        ${addressData.last_name},
        ${addressData.address_line_1},
        ${addressData.address_line_2 || null},
        ${addressData.city},
        ${addressData.state},
        ${addressData.postal_code},
        ${addressData.country},
        ${addressData.phone || null}
      ) RETURNING id
    `
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
      ORDER BY created_at DESC
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
    const result = await sql`
      UPDATE addresses 
      SET 
        first_name = COALESCE(${addressData.first_name}, first_name),
        last_name = COALESCE(${addressData.last_name}, last_name),
        address_line_1 = COALESCE(${addressData.address_line_1}, address_line_1),
        address_line_2 = COALESCE(${addressData.address_line_2}, address_line_2),
        city = COALESCE(${addressData.city}, city),
        state = COALESCE(${addressData.state}, state),
        postal_code = COALESCE(${addressData.postal_code}, postal_code),
        country = COALESCE(${addressData.country}, country),
        phone = COALESCE(${addressData.phone}, phone),
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
