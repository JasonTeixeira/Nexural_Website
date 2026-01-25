"use client"

import type React from "react"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import Link from "next/link"
import { NotificationBell } from "@/components/community/notification-bell"

export function Header() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  const mainNavItems = [
    { name: "Live Trades", href: "/positions" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Indicators", href: "/indicators" },
    { name: "Community", href: "/community" },
    { name: "Leaderboard", href: "/leaderboard" },
  ]

  const secondaryNavItems: { name: string; href: string }[] = []

  const socialLinks = [
    {
      name: "GitHub",
      href: "https://github.com/JasonTeixeira",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      ),
    },
    {
      name: "YouTube",
      href: "https://www.youtube.com/@NexuralTrading",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/jason-teixeira/",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561c.496-.625 1.186-1.561 2.914-1.561 3.096 0 3.682 2.036 3.682 4.685v6.767zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/nexuraltrading/",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
  ]

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault()
      const targetId = href.substring(1)
      const targetElement = document.getElementById(targetId)
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border/50">
      {/* Top Row - Main Navigation */}
      <div className="w-full py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="relative w-10 h-10">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <radialGradient id="bg-gradient" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#00ff88" stopOpacity="0.3"/>
                      <stop offset="50%" stopColor="#00cc66" stopOpacity="0.2"/>
                      <stop offset="100%" stopColor="#000000" stopOpacity="1"/>
                    </radialGradient>
                    <linearGradient id="bar-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#00ff88"/>
                      <stop offset="100%" stopColor="#00cc66"/>
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="45" fill="url(#bg-gradient)" stroke="#00ff88" strokeWidth="1" opacity="0.8"/>
                  <g transform="translate(50, 50)">
                    <g transform="translate(-12, -8)">
                      <rect x="0" y="4" width="3" height="8" fill="url(#bar-gradient)" rx="0.5"/>
                      <rect x="4" y="2" width="3" height="10" fill="url(#bar-gradient)" rx="0.5"/>
                      <rect x="8" y="0" width="3" height="12" fill="url(#bar-gradient)" rx="0.5"/>
                      <rect x="12" y="1" width="3" height="11" fill="url(#bar-gradient)" rx="0.5"/>
                      <rect x="16" y="3" width="3" height="9" fill="url(#bar-gradient)" rx="0.5"/>
                      <rect x="20" y="5" width="3" height="7" fill="url(#bar-gradient)" rx="0.5"/>
                    </g>
                  </g>
                  <circle cx="25" cy="20" r="1.5" fill="#00ff88" opacity="0.8"/>
                  <circle cx="75" cy="25" r="1" fill="#00ff88" opacity="0.6"/>
                  <circle cx="80" cy="40" r="1.8" fill="#00ff88" opacity="0.7"/>
                  <circle cx="20" cy="70" r="1.2" fill="#00ff88" opacity="0.5"/>
                  <circle cx="85" cy="75" r="1.5" fill="#00ff88" opacity="0.6"/>
                </svg>
              </div>
              <span className="text-foreground text-xl font-semibold">
                <span className="text-white">NEXURAL</span>
                <span className="text-[#00ff88] ml-1">TRADING</span>
              </span>
            </Link>
          </div>

          {/* Main Navigation - Hidden on mobile */}
          <nav className="hidden md:flex items-center gap-8">
            {mainNavItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => handleScroll(e, item.href)}
                className="text-[#888888] hover:text-foreground text-sm font-medium transition-colors relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* CTA Buttons - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-3">
            {mounted && <NotificationBell />}
            <Link href="/auth/login">
              <Button 
                variant="outline" 
                className="border-primary/20 text-foreground hover:bg-primary/10 font-medium"
              >
                Member Login
              </Button>
            </Link>
            <a href="https://discord.gg/p8Dy4sQHaR" target="_blank" rel="noopener noreferrer">
              <Button 
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-sm"
              >
                Join Discord
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            {mounted && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-foreground">
                    <Menu className="w-6 h-6" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-background border-l border-border text-foreground w-[300px] sm:w-[400px]">
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-left text-xl font-semibold text-foreground">Menu</SheetTitle>
                  <NotificationBell />
                </div>
              </SheetHeader>
              <nav className="flex flex-col gap-6 mt-8">
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Main</span>
                  {mainNavItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={(e) => handleScroll(e, item.href)}
                      className="text-foreground hover:text-primary text-base font-medium py-2 px-3 rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                
                {secondaryNavItems.length > 0 && (
                  <div className="flex flex-col gap-3 pt-3 border-t border-border">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">More</span>
                    {secondaryNavItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={(e) => handleScroll(e, item.href)}
                        className="text-muted-foreground hover:text-foreground text-sm font-medium py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 pt-3 border-t border-border">
                  {socialLinks.map((social) => (
                    <Link
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary p-2 rounded-lg transition-all duration-200 hover:bg-primary/10"
                      aria-label={social.name}
                    >
                      {social.icon}
                    </Link>
                  ))}
                </div>

                <div className="flex flex-col gap-3 pt-3 border-t border-border">
                  <Link href="/auth/login" className="w-full">
                    <Button 
                      variant="outline" 
                      className="w-full border-primary/20 text-foreground hover:bg-primary/10 font-medium"
                    >
                      Member Login
                    </Button>
                  </Link>
                  <a href="https://discord.gg/p8Dy4sQHaR" target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button 
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-sm"
                    >
                      Join Discord
                    </Button>
                  </a>
                </div>
              </nav>
            </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row - Secondary Navigation & Social (Desktop Only) - Hidden when no secondary items */}
      {secondaryNavItems.length > 0 && (
        <div className="hidden md:block w-full bg-muted/30 border-t border-border/30">
          <div className="max-w-7xl mx-auto px-6 py-2.5">
            <div className="flex items-center justify-between">
              {/* Secondary Navigation */}
              <nav className="flex items-center gap-6">
                {secondaryNavItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleScroll(e, item.href)}
                    className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Social Links */}
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <Link
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary p-1.5 rounded-md transition-all duration-200 hover:bg-primary/10"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
