import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ApolloWrapper from "@/components/ApolloWrapper";
import CosmicTopNav from "@/components/CosmicTopNav";
import SessionWrapper from "@/components/SessionWrapper";
import Link from "next/link";
import { MusicPlayerProvider } from "@/context/MusicPlayerProvider";
import MiniPlayer from "@/components/music/MiniPlayer";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Cosmic Multiverse",
    description:
        "A music-based emotional navigation system. Six realms. Six soundtracks. One cosmic journey.",
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
                <SessionWrapper>
                    <ApolloWrapper>
                        <MusicPlayerProvider>
                            <CosmicTopNav />

                            <main className="flex-grow">
                                {children}
                            </main>

                            <footer className="cosmic-bottom-nav">
                                <nav className="cosmic-bottom-nav-inner cosmic-bottom-nav-five">
                                    <Link href="/" className="cosmic-bottom-link">
                                        <span>Home</span>
                                    </Link>

                                    <Link href="/nexus" className="cosmic-bottom-link">
                                        <span>Nexus</span>
                                    </Link>

                                    <Link href="/find-your-realm" className="cosmic-bottom-link">
                                        <span>Align</span>
                                    </Link>

                                    <Link href="/leaderboard" className="cosmic-bottom-link">
                                        <span>Rank</span>
                                    </Link>

                                    <Link href="/profile" className="cosmic-bottom-link">
                                        <span>Profile</span>
                                    </Link>
                                </nav>
                            </footer>

                            <MiniPlayer />
                        </MusicPlayerProvider>
                    </ApolloWrapper>
                </SessionWrapper>
            </body>
        </html>
    );
}