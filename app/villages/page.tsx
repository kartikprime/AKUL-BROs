import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { ErrorBanner } from "@/components/error-banner";
import { Shell } from "@/components/shell";
import { VillageManager } from "@/components/villages/village-manager";
import { getSessionUser } from "@/lib/auth/session";
import { listVillages } from "@/lib/actions/villages";

export const dynamic = "force-dynamic";

export default async function VillagesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/");
  const { villages, error } = await listVillages();

  return (
    <Shell>
      <AppHeader user={user} title="VILLAGES" subtitle="SELECT A VILLAGE TO CONTINUE" />
      <ErrorBanner message={error} />
      <VillageManager initialVillages={villages} />
    </Shell>
  );
}
