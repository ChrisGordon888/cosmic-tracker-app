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
  },
  callbacks: {
    async jwt({ token }) {
      // ✅ Create a signed JWT string yourself:
      const customJwt = jwt.sign(
        {
          sub: token.sub,
          email: token.email,
        },
        process.env.NEXTAUTH_SECRET,
        { expiresIn: "1h" }
      );
      return { ...token, accessToken: customJwt };
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub;
      }
      session.accessToken = token.accessToken; // ✅ Use your custom signed JWT
      return session;
    },
  },
});