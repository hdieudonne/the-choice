import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/AdminShell";

export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.trim().toLowerCase();

  if (!email) {
    redirect("/admin/login");
  }

  const admin = await prisma.adminUser.findUnique({
    where: { email },
    select: { name: true, email: true, isActive: true },
  });

  if (!admin?.isActive) {
    redirect("/admin/login?error=SessionExpired");
  }

  return (
    <AdminShell adminName={admin.name} adminEmail={admin.email}>
      {children}
    </AdminShell>
  );
}
