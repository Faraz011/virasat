import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// Create a SQL client with the database connection string
export const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql)

// Helper function to execute raw SQL queries with parameters
export async function executeQuery(query: string, params: any[] = []) {
  try {
    // Use sql.query for parameterized queries
    return await sql.query(query, params)
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Helper function for simple queries without parameters using tagged template literals
export async function sqlQuery(strings: TemplateStringsArray, ...values: any[]) {
  try {
    return await sql(strings, ...values)
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Test database connection
export async function testConnection() {
  try {
    const result = await sql`SELECT 1 as test`
    return result[0].test === 1
  } catch (error) {
    console.error("Database connection test failed:", error)
    return false
  }
}
