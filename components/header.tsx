"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { navLinks, site } from "@/lib/site"
import { cn } from "@/lib/utils"

export function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          {/* Logo con la nueva imagen */}
          <div className="relative size-10 shrink-0 overflow-hidden">
            <Image
              src="/logo.png"
              alt="Panda Rojo Boutique Logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          <span className="font-serif text-lg font-bold leading-none tracking-tight text-foreground sm:text-xl">
            PANDA ROJO
            <span className="block text-[0.65rem] font-sans font-medium uppercase tracking-[0.25em] text-primary">
              Boutique
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary"
                  />
                )}
              </Link>
            )
          })}
        </nav>

        <button
          type="button"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-md p-2 text-foreground transition-colors hover:bg-muted lg:hidden"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-border bg-background lg:hidden"
          >
            <ul className="flex flex-col gap-1 px-4 py-4">
              {navLinks.map((link) => {
                const active = pathname === link.href
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block rounded-md px-3 py-3 text-base font-medium transition-colors",
                        active
                          ? "bg-accent text-primary"
                          : "text-foreground hover:bg-muted",
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
            <p className="border-t border-border px-7 py-3 text-xs text-muted-foreground">
              {site.city}
            </p>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}