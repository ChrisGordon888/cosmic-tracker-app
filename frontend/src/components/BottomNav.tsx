"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import "@/styles/bottomNav.css";

const publicItems = [
    { href: "/", icon: "🌌", label: "Home" },
    { href: "/nexus", icon: "🎵", label: "Nexus" },
    { href: "/find-your-realm", icon: "◐", label: "Align" },
    { href: "/scroll", icon: "🌀", label: "Scroll" },
    { href: "/services", icon: "◇", label: "Services" },
];

const signedInItems = [
    { href: "/nexus", icon: "🎵", label: "Nexus" },
    { href: "/find-your-realm", icon: "◐", label: "Align" },
    { href: "/practice", icon: "✦", label: "Practice" },
    { href: "/creator", icon: "◇", label: "Creator" },
    { href: "/profile", icon: "👤", label: "Profile" },
];

function isRouteActive(pathname: string | null, href: string) {
    if (!pathname) return false;

    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
}

export default function BottomNav() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const navItems = session?.user ? signedInItems : publicItems;

    return (
        <nav className="bottom-nav" aria-label="Primary mobile navigation">
            {navItems.map(({ href, icon, label }) => {
                const isActive = isRouteActive(pathname, href);

                return (
                    <Link
                        key={href}
                        href={href}
                        className={`nav-icon ${isActive ? "active" : ""}`}
                        aria-current={isActive ? "page" : undefined}
                    >
                        <span className="nav-icon-mark" aria-hidden="true">
                            {icon}
                        </span>
                        <span className="nav-icon-label">{label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
