import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ApolloWrapper from "@/components/ApolloWrapper";
import CosmicTopNav from "@/components/CosmicTopNav"; // ✅ Import top nav
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cosmic Tracker",
  description: "A personalized tracker and ritual planner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ApolloWrapper>
          <CosmicTopNav /> {/* ✅ Add the top nav here */}
          <div className="flex-grow">{children}</div>
          <footer className="border-t border-gray-200 bg-white dark:bg-gray-900 p-2">
            <nav className="flex justify-around text-center text-sm font-medium">
              <Link href="/home" className="hover:text-indigo-600">
                🏠 Home
              </Link>
              <Link href="/calendar" className="hover:text-indigo-600">
                📆 Calendar
              </Link>
              <Link href="/rituals" className="hover:text-indigo-600">
                📖 Rituals
              </Link>
              <Link href="/tracker" className="hover:text-indigo-600">
                🌟 Tracker
              </Link>
              <Link href="/profile" className="hover:text-indigo-600">
                ⚙️ Profile
              </Link>
            </nav>
          </footer>
        </ApolloWrapper>
      </body>
    </html>
  );
}