import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import jwt from "jsonwebtoken";

export default NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,       // 24 hours for the session itself
  },
  jwt: {
    maxAge: 24 * 60 * 60,       // 24 hours for the token lifetime
  },
  callbacks: {
    async jwt({ token }) {
      // ✅ Only sign if we're issuing a new token (first login or refresh)
      if (!token.accessToken) {
        const customJwt = jwt.sign(
          {
            sub: token.sub,
            email: token.email,
          },
          process.env.NEXTAUTH_SECRET,
          { expiresIn: "24h" }
        );
        token.accessToken = customJwt;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub;
      }
      session.accessToken = token.accessToken; // ✅ Use our custom signed JWT
      return session;
    },
  },
});