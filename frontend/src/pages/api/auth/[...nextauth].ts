import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { backendAccessToken } from "@/server/backendAccessToken";

const nextAuthSecret = process.env.NEXTAUTH_SECRET;

if (!nextAuthSecret) {
  throw new Error("NEXTAUTH_SECRET is not defined");
}

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],

  secret: nextAuthSecret,

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },

  jwt: {
    maxAge: 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token }) {
      token.accessToken = backendAccessToken(token, nextAuthSecret);

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
      }

      session.accessToken = token.accessToken;

      return session;
    },
  },
});