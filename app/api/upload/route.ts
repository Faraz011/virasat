import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    // Only allow authenticated users to upload images
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin for product images
    const isProductImage = request.headers.get("x-product-image") === "true"
    if (isProductImage && !user.is_admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ message: "Invalid file type. Only JPEG, PNG, and WebP are allowed" }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: "File too large. Maximum size is 5MB" }, { status: 400 })
    }

    // Generate a unique filename
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 10)
    const filename = `${timestamp}-${randomId}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`

    // Determine the folder based on the image type
    const folder = isProductImage ? "products" : "user-uploads"
    const pathname = `${folder}/${filename}`

    // Upload to Vercel Blob
    const blob = await put(pathname, file, {
      access: "public",
    })

    return NextResponse.json(blob)
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ message: "Failed to upload file" }, { status: 500 })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
