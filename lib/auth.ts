import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { credentialsSchema } from "@/lib/validators";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.pick({ email: true, password: true }).safeParse(credentials);
        if (!parsed.success) return null;
        const email = parsed.data.email.toLowerCase();
        const db = await connectDB();
        if (!db) return null;
        const user = await User.findOne({ email }).select("+passwordHash");
        if (!user) {
          const admin = await bootstrapAdmin(email, parsed.data.password);
          return admin;
        }
        const matches = await compare(parsed.data.password, user.passwordHash);
        if (!matches) return null;
        return { id: String(user._id), email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.sub = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role ?? "candidate";
      }
      return session;
    },
  },
});

async function bootstrapAdmin(email: string, password: string) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword || email !== adminEmail || password !== adminPassword) return null;
  const { hash } = await import("bcryptjs");
  const passwordHash = await hash(password, 12);
  const user = await User.create({
    email,
    name: "Administrator",
    passwordHash,
    role: "admin",
  });
  return { id: String(user._id), email: user.email, name: user.name, role: user.role as "admin" };
}

export async function currentSession() {
  if (!process.env.NEXTAUTH_SECRET && !process.env.AUTH_SECRET) return null;
  try {
    return await auth();
  } catch {
    return null;
  }
}

export async function requireUser(role?: "admin" | "employer") {
  const session = await currentSession();
  if (!session?.user) redirect("/login");
  if (role === "admin" && session.user.role !== "admin") redirect("/");
  if (role === "employer" && session.user.role === "candidate") redirect("/employers");
  return session;
}
