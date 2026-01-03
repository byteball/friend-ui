"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"

import { cn } from "@/lib/utils"
import { SheetClose } from "../ui/sheet"

export interface NavigationLink {
  text: string
  href: string
}

interface NavbarLinkItemProps
  extends Omit<React.ComponentProps<typeof Link>, "href" | "children"> {
  link: NavigationLink
  activeClassName?: string
}

export function NavbarLinkItem({
  link,
  className,
  activeClassName = "text-white",
  prefetch = false,
  ...props
}: NavbarLinkItemProps) {
  const pathname = usePathname()

  const isActive = React.useMemo(() => {
    if (!pathname) return false

    if (link.href === "/") {
      return pathname === "/"
    }

    return pathname.startsWith(link.href)
  }, [pathname, link.href])

  return (
    <SheetClose asChild>
      <Link
        href={link.href}
        prefetch={prefetch}
        className={cn(className, isActive && activeClassName, "ui-link text-md")}
        {...props}
      >
        {link.text}
      </Link>
    </SheetClose>
  )
}
