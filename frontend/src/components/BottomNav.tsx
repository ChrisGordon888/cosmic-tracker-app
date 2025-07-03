"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "@/styles/bottomNav.css";

const navItems = [
  { href: "/home", label: "🏠" },
  { href: "/calendar", label: "📆" },
  { href: "/rituals", label: "📖" },
  { href: "/tracker", label: "🌟" },
  { href: "/profile", label: "⚙️" },
];

export default function BottomNav() {
    const pathname = usePathname();
  
    return (
      <nav className="bottom-nav">
        {navItems.map(({ href, label }) => (
          <Link key={href} href={href} legacyBehavior>
            <a className={`nav-icon ${pathname === href ? "active" : ""}`}>
              {label}
            </a>
          </Link>
        ))}
      </nav>
    );
  }