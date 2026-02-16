"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, HelpCircle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const DOC_LINKS = [
  {
    title: "Getting Started",
    href: "/docs",
    icon: BookOpen,
  },
  {
    title: "How to Use",
    href: "/docs/how-to-use",
    icon: FileText,
  },
  {
    title: "FAQ",
    href: "/docs/faq",
    icon: HelpCircle,
  },
];

export function DocsNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      <h2 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
        Documentation
      </h2>
      {DOC_LINKS.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              isActive
                ? "bg-primary text-primary-foreground font-medium"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {link.title}
          </Link>
        );
      })}
    </nav>
  );
}
