import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { CustomerManager } from "@/components/customers/customer-manager";
import { ErrorBanner } from "@/components/error-banner";
import { Shell } from "@/components/shell";
import { listCustomers } from "@/lib/actions/customers";
import { getVillage } from "@/lib/actions/villages";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  params,
}: {
  params: Promise<{ villageId: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/");
  const { villageId } = await params;
  const { village, error: villageError } = await getVillage(villageId);
  if (!village) {
    if (villageError) {
      return (
        <Shell>
          <AppHeader user={user} title="CUSTOMERS" backHref="/villages" />
          <ErrorBanner message={villageError} />
        </Shell>
      );
    }
    notFound();
  }

  const { customers, error } = await listCustomers(villageId, "modified");

  return (
    <Shell>
      <AppHeader
        user={user}
        title="CUSTOMER SUMMARY"
        subtitle={village.name}
        backHref={`/villages/${village.id}`}
      />
      <ErrorBanner message={error} />
      <CustomerManager
        villageId={village.id}
        villageName={village.name}
        initialCustomers={customers}
      />
    </Shell>
  );
}
