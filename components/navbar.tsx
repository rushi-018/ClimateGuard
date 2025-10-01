"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Globe, BarChart3, Info } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">ClimateGuard</span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/global"
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span>Global View</span>
          </Link>
          <Link
            href="/about"
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Info className="w-4 h-4" />
            <span>About</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild>
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
