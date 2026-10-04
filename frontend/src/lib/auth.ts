import { AuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "MOCK_CLIENT_ID",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "MOCK_CLIENT_SECRET",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "MOCK_CLIENT_ID",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "MOCK_CLIENT_SECRET",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("InvalidCredentials");
        }

        if (!user.password) {
          // User registered via Google (no password)
          throw new Error("GoogleAccountExists");
        }

        const { verifyPassword } = await import("@/lib/crypto");
        const isValid = verifyPassword(credentials.password, user.password);

        if (isValid) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        }

        throw new Error("InvalidCredentials");
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Check for Google login attempts on manual accounts
      if (account?.provider === "google" && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        
        // If the user exists and has a password, they are a manual account.
        // Reject Google login to enforce strict registration rules.
        if (existingUser && existingUser.password) {
          return "/?error=ManualAccountExists";
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
};

export const getAuthSession = () => getServerSession(authOptions);
