import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium font-serif">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shop" className="text-muted-foreground hover:text-foreground">
                  All Sarees
                </Link>
              </li>
              <li>
                <Link href="/categories/silk-sarees" className="text-muted-foreground hover:text-foreground">
                  Silk Sarees
                </Link>
              </li>
              <li>
                <Link href="/categories/cotton-sarees" className="text-muted-foreground hover:text-foreground">
                  Cotton Sarees
                </Link>
              </li>
              <li>
                <Link href="/categories/linen-sarees" className="text-muted-foreground hover:text-foreground">
                  Linen Sarees
                </Link>
              </li>
              <li>
                <Link href="/collections/bridal" className="text-muted-foreground hover:text-foreground">
                  Bridal Collection
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium font-serif">About</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/artisans" className="text-muted-foreground hover:text-foreground">
                  Artisan Communities
                </Link>
              </li>
              <li>
                <Link href="/sustainability" className="text-muted-foreground hover:text-foreground">
                  Sustainability
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-muted-foreground hover:text-foreground">
                  Press
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium font-serif">Customer Care</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-muted-foreground hover:text-foreground">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="/care-guide" className="text-muted-foreground hover:text-foreground">
                  Saree Care Guide
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="text-muted-foreground hover:text-foreground">
                  Size Guide
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium font-serif">Connect</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="https://instagram.com"
                  target="_blank"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Instagram
                </Link>
              </li>
              <li>
                <Link
                  href="https://facebook.com"
                  target="_blank"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Facebook
                </Link>
              </li>
              <li>
                <Link
                  href="https://pinterest.com"
                  target="_blank"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Pinterest
                </Link>
              </li>
              <li>
                <Link
                  href="https://youtube.com"
                  target="_blank"
                  className="text-muted-foreground hover:text-foreground"
                >
                  YouTube
                </Link>
              </li>
            </ul>
            <div className="pt-2">
              <h4 className="text-sm font-medium mb-2">We Accept</h4>
              <div className="flex gap-2">
                <div className="h-8 w-12 bg-muted rounded"></div>
                <div className="h-8 w-12 bg-muted rounded"></div>
                <div className="h-8 w-12 bg-muted rounded"></div>
                <div className="h-8 w-12 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t mt-8 pt-8">
          <p className="text-sm text-muted-foreground">
            © 2025 Virasat. All rights reserved. Celebrating the art of handwoven sarees.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
