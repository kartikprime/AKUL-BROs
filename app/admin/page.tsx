import { redirect } from "next/navigation";
import { UserManager } from "@/components/admin/user-manager";
import { AppHeader } from "@/components/app-header";
import { ErrorBanner } from "@/components/error-banner";
import { Shell } from "@/components/shell";
import { listAppUsers } from "@/lib/actions/users";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/");
  if (user.role !== "admin") redirect("/villages");

  const { users, error } = await listAppUsers();

  return (
    <Shell>
      <AppHeader user={user} title="ADMIN" subtitle="USER PASSWORD MANAGEMENT" backHref="/villages" />
      <ErrorBanner message={error} />
      <UserManager currentUserId={user.id} initialUsers={users} />
    </Shell>
  );
}
