"use client"

import { useState, useEffect } from "react"
import { ImageUpload } from "@/components/image-upload"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Star, Trash2 } from "lucide-react"

interface ProductImage {
  id: number
  product_id: number
  image_url: string
  is_primary: boolean
  display_order: number
}

interface ProductImagesManagerProps {
  productId: number
}

export function ProductImagesManager({ productId }: ProductImagesManagerProps) {
  const [images, setImages] = useState<ProductImage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (productId) {
      fetchImages()
    }
  }, [productId])

  const fetchImages = async () => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/images`)
      if (!response.ok) {
        throw new Error("Failed to fetch images")
      }
      const data = await response.json()
      setImages(data)
    } catch (error) {
      console.error("Error fetching images:", error)
      toast({
        title: "Error",
        description: "Failed to load product images",
        variant: "destructive",
      })
    }
  }

  const handleAddImage = async (url: string) => {
    if (!url) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/products/${productId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: url,
          isPrimary: images.length === 0, // Make primary if it's the first image
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add image")
      }

      await fetchImages()
      toast({
        title: "Image added",
        description: "Product image has been added successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product image",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetPrimary = async (imageId: number) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/images`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageId,
          isPrimary: true,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update image")
      }

      await fetchImages()
      toast({
        title: "Primary image updated",
        description: "Primary product image has been updated",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update primary image",
        variant: "destructive",
      })
    }
  }

  const handleDeleteImage = async (imageId: number) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/images?imageId=${imageId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete image")
      }

      await fetchImages()
      toast({
        title: "Image deleted",
        description: "Product image has been deleted",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product image",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Product Images</h3>
      <p className="text-sm text-muted-foreground">
        Upload additional images for this product. The primary image will be displayed as the main product image.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {images.map((image) => (
          <div key={image.id} className="relative border rounded-md overflow-hidden">
            <img
              src={image.image_url || "/placeholder.svg"}
              alt="Product"
              className="w-full aspect-square object-cover"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              {!image.is_primary && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-white/80 hover:bg-white/90"
                  onClick={() => handleSetPrimary(image.id)}
                >
                  <Star className="h-4 w-4" />
                  <span className="sr-only">Set as primary</span>
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-white/80 hover:bg-white/90 text-red-500 hover:text-red-600"
                onClick={() => handleDeleteImage(image.id)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete image</span>
              </Button>
            </div>
            {image.is_primary && (
              <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-0.5 text-xs font-medium rounded">
                Primary
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-4">
        <ImageUpload onUpload={handleAddImage} isProductImage={true} />
      </div>
    </div>
  )
}
