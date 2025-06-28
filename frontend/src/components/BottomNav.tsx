// src/components/BottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
    <nav className="fixed bottom-0 w-full bg-white border-t flex justify-around py-2">
      {navItems.map(({ href, label }) => (
        <Link key={href} href={href}>
          <span
            className={`text-xl ${
              pathname === href ? "text-indigo-600" : "text-gray-500"
            }`}
          >
            {label}
          </span>
        </Link>
      ))}
    </nav>
  );
}