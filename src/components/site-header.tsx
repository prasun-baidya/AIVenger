"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Menu, X } from "lucide-react";
import { UserProfile } from "@/components/auth/user-profile";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { ModeToggle } from "./ui/mode-toggle";

const NAV_LINKS = {
  public: [
    { href: "/pricing", label: "Pricing" },
    { href: "/docs", label: "Docs" },
  ],
  authenticated: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/gallery", label: "Gallery" },
    { href: "/chat", label: "Chat" },
  ],
};

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  const allLinks = [
    ...(session ? NAV_LINKS.authenticated : []),
    ...NAV_LINKS.public,
  ];

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:border focus:rounded-md"
      >
        Skip to main content
      </a>
      <header className="border-b sticky top-0 bg-background z-40" role="banner">
        <nav
          className="container mx-auto px-4 py-4 flex justify-between items-center"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <h1 className="text-2xl font-bold">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              aria-label="AIVenger - Go to homepage"
            >
              <div
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500"
                aria-hidden="true"
              >
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                AIVenger
              </span>
            </Link>
          </h1>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {allLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div
            className="hidden md:flex items-center gap-4"
            role="group"
            aria-label="User actions"
          >
            <UserProfile />
            <ModeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ModeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-muted rounded-md transition-colors"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t">
            <div className="container mx-auto px-4 py-4 space-y-4">
              {allLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t">
                <UserProfile />
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
