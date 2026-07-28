import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ApolloWrapper from "@/components/ApolloWrapper";
import CosmicTopNav from "@/components/CosmicTopNav";
import SessionWrapper from "@/components/SessionWrapper";
import BottomNav from "@/components/BottomNav";
import { MusicPlayerProvider } from "@/context/MusicPlayerProvider";
import MiniPlayer from "@/components/music/MiniPlayer";
import { PlatformAccessProvider } from "@/context/PlatformAccessProvider";
import { CreatorViewProvider } from "@/context/CreatorViewProvider";
import PublicPreviewBanner from "@/components/creator/PublicPreviewBanner";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Cosmic Multiverse",
    description: "A music-based emotional navigation system. Six realms. Six soundtracks. One cosmic journey.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
                <SessionWrapper>
                    <ApolloWrapper>
                        <PlatformAccessProvider>
                            <CreatorViewProvider>
                                <MusicPlayerProvider>
                                    <CosmicTopNav />
                                    <PublicPreviewBanner />
                                    <main className="flex-grow">{children}</main>
                                    <BottomNav />
                                    <MiniPlayer />
                                </MusicPlayerProvider>
                            </CreatorViewProvider>
                        </PlatformAccessProvider>
                    </ApolloWrapper>
                </SessionWrapper>
            </body>
        </html>
    );
}
