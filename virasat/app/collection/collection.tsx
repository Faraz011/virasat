"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, ShoppingCart, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  
} from "@/components/ui/pagination"

export default function ProductCatalog() {
  const [currentPage, setCurrentPage] = useState(1)
  const [showCollections, setShowCollections] = useState(false)

  // Mock product data
  const allProducts = [
    {
      id: 1,
      name: "Classic White T-Shirt",
      price: "$29.99",
      category: "Tops",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 2,
      name: "Slim Fit Jeans",
      price: "$59.99",
      category: "Bottoms",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 3,
      name: "Leather Jacket",
      price: "$199.99",
      category: "Outerwear",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 4,
      name: "Summer Dress",
      price: "$49.99",
      category: "Dresses",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 5,
      name: "Running Shoes",
      price: "$89.99",
      category: "Footwear",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 6,
      name: "Wool Sweater",
      price: "$69.99",
      category: "Tops",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 7,
      name: "Cargo Pants",
      price: "$54.99",
      category: "Bottoms",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 8,
      name: "Floral Blouse",
      price: "$39.99",
      category: "Tops",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 9,
      name: "Denim Jacket",
      price: "$79.99",
      category: "Outerwear",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 10,
      name: "Maxi Skirt",
      price: "$44.99",
      category: "Bottoms",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 11,
      name: "Graphic Tee",
      price: "$24.99",
      category: "Tops",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 12,
      name: "Chino Shorts",
      price: "$34.99",
      category: "Bottoms",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 13,
      name: "Puffer Vest",
      price: "$59.99",
      category: "Outerwear",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 14,
      name: "Knit Beanie",
      price: "$19.99",
      category: "Accessories",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 15,
      name: "Crossbody Bag",
      price: "$49.99",
      category: "Accessories",
      image: "/placeholder.svg?height=300&width=300",
    },
  ]

  // Pagination logic
  const productsPerPage = 6
  const totalPages = Math.ceil(allProducts.length / productsPerPage)

  // Get current products
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = allProducts.slice(indexOfFirstProduct, indexOfLastProduct)

  // Change page
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber)
    window.scrollTo(0, 0)
  }

  const toggleCollections = () => {
    setShowCollections(!showCollections)
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6 md:gap-8 lg:gap-10">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
            <Link href="/" className="font-bold text-xl">
              BRAND
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link href="/" className="text-sm font-medium transition-colors hover:text-foreground/80">
                Home
              </Link>
              <button
                onClick={toggleCollections}
                className="text-sm font-medium transition-colors hover:text-foreground/80 text-primary"
              >
                Collections
              </button>
              <Link href="#" className="text-sm font-medium transition-colors hover:text-foreground/80">
                New Arrivals
              </Link>
              <Link href="#" className="text-sm font-medium transition-colors hover:text-foreground/80">
                Sale
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
              <span className="sr-only">Account</span>
            </Button>
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Cart</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Collections dropdown */}
      {showCollections && (
        <div className="container border-b py-4 bg-background">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <h3 className="font-medium mb-2">Women</h3>
              <ul className="space-y-1">
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Tops
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Bottoms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Dresses
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Outerwear
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Men</h3>
              <ul className="space-y-1">
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Shirts
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Pants
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Suits
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Jackets
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Accessories</h3>
              <ul className="space-y-1">
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Bags
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Jewelry
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Hats
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Scarves
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Collections</h3>
              <ul className="space-y-1">
                <li>
                  <Link href="#" className="text-sm text-primary font-medium">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Summer 2023
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Winter Essentials
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Bestsellers
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 container py-8">
        <div className="flex flex-col gap-8">
          {/* Page header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Products</h1>
            <p className="text-muted-foreground mt-2">Browse our complete collection of products</p>
          </div>

          {/* Products grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {currentProducts.map((product) => (
              <div key={product.id} className="group relative overflow-hidden rounded-lg border">
                <Link href={`/products/${product.id}`} className="absolute inset-0 z-10">
                  <span className="sr-only">View {product.name}</span>
                </Link>
                <div className="aspect-square overflow-hidden">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                  <p className="mt-2 font-medium">{product.price}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage > 1) goToPage(currentPage - 1)
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, current page, last page, and pages around current
                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={page === currentPage}
                        onClick={(e) => {
                          e.preventDefault()
                          goToPage(page)
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                }

                // Show ellipsis for gaps
                if ((page === 2 && currentPage > 3) || (page === totalPages - 1 && currentPage < totalPages - 2)) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )
                }

                return null
              })}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage < totalPages) goToPage(currentPage + 1)
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">© 2023 BRAND. All rights reserved.</p>
          </div>
          <div className="flex justify-center gap-4 md:justify-end">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
