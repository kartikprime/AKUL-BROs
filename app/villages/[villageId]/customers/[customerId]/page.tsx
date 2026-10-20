import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { ErrorBanner } from "@/components/error-banner";
import { Shell } from "@/components/shell";
import { CustomerSummary } from "@/components/summary/customer-summary";
import { getCustomer } from "@/lib/actions/customers";
import { listCustomerEntries } from "@/lib/actions/entries";
import { getCycleParameters } from "@/lib/actions/parameters";
import { getVillage } from "@/lib/actions/villages";
import { getSessionUser } from "@/lib/auth/session";
import { getDaysInMonth } from "@/lib/calculations";
import { currentYearMonth, toDateString } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CustomerSummaryPage({
  params,
}: {
  params: Promise<{ villageId: string; customerId: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/");
  const { villageId, customerId } = await params;
  const [{ village, error: villageError }, { customer, error: customerError }] = await Promise.all([
    getVillage(villageId),
    getCustomer(customerId),
  ]);

  if (!village || !customer || customer.villageId !== villageId) {
    if (villageError || customerError) {
      return (
        <Shell>
          <AppHeader user={user} title="CUSTOMER SUMMARY" backHref="/villages" />
          <ErrorBanner message={villageError || customerError} />
        </Shell>
      );
    }
    notFound();
  }

  const { year, month } = currentYearMonth();
  const startDate = toDateString(year, month, 1);
  const endDate = toDateString(year, month, getDaysInMonth(year, month));
  const [{ entries, error: entryError }, { parameters, error: paramError }] = await Promise.all([
    listCustomerEntries({ customerId, startDate, endDate }),
    getCycleParameters(customerId, 1),
  ]);

  return (
    <Shell>
      <AppHeader
        user={user}
        title={customer.name}
        subtitle={`${customer.customerNumber} · ${village.name}`}
        backHref={`/villages/${village.id}/customers`}
      />
      <ErrorBanner message={entryError || paramError} />
      <CustomerSummary
        village={village}
        customer={customer}
        initialYear={year}
        initialMonth={month}
        initialEntries={entries}
        initialParameters={parameters}
      />
    </Shell>
  );
}
