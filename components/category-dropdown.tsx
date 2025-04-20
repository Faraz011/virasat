"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type CategoryLink = {
  name: string
  href: string
}

const categoryLinks: CategoryLink[] = [
  { name: "Banarasi Silk", href: "/categories/banarasi-silk" },
  { name: "Kanjivaram", href: "/categories/kanjivaram" },
  { name: "Chanderi", href: "/categories/chanderi" },
  { name: "Jamdani", href: "/categories/jamdani" },
]

export function CategoryDropdown({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="px-2 py-1 h-auto text-sm font-medium">
          Categories
          <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem asChild>
          <Link href="/categories" className={cn("w-full cursor-pointer", pathname === "/categories" && "font-medium")}>
            All Categories
          </Link>
        </DropdownMenuItem>
        {categoryLinks.map((link) => (
          <DropdownMenuItem key={link.href} asChild>
            <Link href={link.href} className={cn("w-full cursor-pointer", pathname === link.href && "font-medium")}>
              {link.name}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
