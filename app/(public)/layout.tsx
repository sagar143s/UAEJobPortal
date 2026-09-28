import { currentSession } from "@/lib/auth";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await currentSession();
  return (
    <>
      <Header user={session?.user ? { name: session.user.name, role: session.user.role } : null} />
      <main id="content" className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
