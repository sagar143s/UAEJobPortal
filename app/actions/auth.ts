"use server";

import { AuthError } from "next-auth";
import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { credentialsSchema } from "@/lib/validators";

export async function loginAction(formData: FormData) {
  const next = safeNext(String(formData.get("next") || "/"));
  try {
    await signIn("credentials", {
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
      redirectTo: next,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
    }
    throw error;
  }
}

export async function registerAction(formData: FormData) {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
    role: formData.get("role") || "candidate",
  });
  if (!parsed.success || !parsed.data.name) {
    redirect("/register?error=1");
  }
  const email = parsed.data.email.toLowerCase();
  if (process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL.trim().toLowerCase()) {
    redirect("/register?error=reserved");
  }
  const db = await connectDB();
  if (!db) redirect("/register?error=db");
  const existing = await User.findOne({ email }).lean();
  if (existing) redirect("/register?error=exists");
  await User.create({
    email,
    name: parsed.data.name,
    passwordHash: await hash(parsed.data.password, 12),
    role: parsed.data.role || "candidate",
  });
  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: parsed.data.role === "employer" ? "/employers/jobs" : "/",
    });
  } catch (error) {
    if (error instanceof AuthError) redirect("/login?error=1");
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

function safeNext(value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}
