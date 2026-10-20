import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { DailyEntryBoard } from "@/components/daily-entry/daily-entry-board";
import { ErrorBanner } from "@/components/error-banner";
import { Shell } from "@/components/shell";
import { listCustomers } from "@/lib/actions/customers";
import { listDailyEntries } from "@/lib/actions/entries";
import { getVillage } from "@/lib/actions/villages";
import { getSessionUser } from "@/lib/auth/session";
import { getDaysInMonth } from "@/lib/calculations";
import { currentYearMonth, toDateString } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DailyEntryPage({
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
          <AppHeader user={user} title="DAILY ENTRY" backHref="/villages" />
          <ErrorBanner message={villageError} />
        </Shell>
      );
    }
    notFound();
  }

  const { year, month } = currentYearMonth();
  const startDate = toDateString(year, month, 1);
  const endDate = toDateString(year, month, getDaysInMonth(year, month));
  const [{ customers, error: customerError }, { entries, error: entryError }] =
    await Promise.all([
      listCustomers(villageId, "modified"),
      listDailyEntries({ villageId, startDate, endDate }),
    ]);

  return (
    <Shell>
      <AppHeader
        user={user}
        title="DAILY ENTRY"
        subtitle={village.name}
        backHref={`/villages/${village.id}`}
      />
      <ErrorBanner message={customerError || entryError} />
      <DailyEntryBoard
        village={village}
        customers={customers}
        initialYear={year}
        initialMonth={month}
        initialEntries={entries}
      />
    </Shell>
  );
}
