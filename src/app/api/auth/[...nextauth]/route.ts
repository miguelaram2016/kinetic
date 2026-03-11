import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db/mongodb";
import { User } from "@/lib/models/User";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        console.log("Authorize called with:", credentials?.email);
        
        if (!credentials?.email || !credentials?.name) {
          console.log("Missing credentials");
          return null;
        }

        try {
          console.log("Connecting to MongoDB...");
          await dbConnect();
          console.log("Connected to MongoDB");
          
          let user = await User.findOne({ email: credentials.email.toLowerCase() });
          console.log("User found:", user);
          
          // Auto-create if doesn't exist
          if (!user) {
            console.log("Creating new user...");
            user = await User.create({
              email: credentials.email.toLowerCase(),
              name: credentials.name,
            });
            console.log("User created:", user);
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
});

export { handler as GET, handler as POST };
