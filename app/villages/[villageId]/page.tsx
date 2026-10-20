import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { ErrorBanner } from "@/components/error-banner";
import { Shell } from "@/components/shell";
import { getSessionUser } from "@/lib/auth/session";
import { getVillage } from "@/lib/actions/villages";

export const dynamic = "force-dynamic";

export default async function VillageDashboardPage({
  params,
}: {
  params: Promise<{ villageId: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/");
  const { villageId } = await params;
  const { village, error } = await getVillage(villageId);
  if (!village) {
    if (error) {
      return (
        <Shell>
          <AppHeader user={user} title="VILLAGE" backHref="/villages" />
          <ErrorBanner message={error} />
        </Shell>
      );
    }
    notFound();
  }

  return (
    <Shell>
      <AppHeader
        user={user}
        title={village.name}
        subtitle={`VILLAGE CODE: ${village.code}`}
        backHref="/villages"
      />
      <div className="grid gap-3">
        <Link href={`/villages/${village.id}/daily-entry`} className="card p-5">
          <p className="label-text">DAILY ENTRY</p>
          <h2 className="section-heading mt-2">ENTER MILK BY DATE AND SHIFT</h2>
        </Link>
        <Link href={`/villages/${village.id}/customers`} className="card p-5">
          <p className="label-text">CUSTOMER SUMMARY</p>
          <h2 className="section-heading mt-2">OPEN CUSTOMER MONTHLY SUMMARY</h2>
        </Link>
      </div>
    </Shell>
  );
}
