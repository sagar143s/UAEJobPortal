import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "candidate" | "employer" | "admin";
    } & DefaultSession["user"];
  }

  interface User {
    role: "candidate" | "employer" | "admin";
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: "candidate" | "employer" | "admin";
  }
}
