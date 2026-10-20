import Link from "next/link";
import { logout } from "@/lib/actions/auth";
import type { SessionUser } from "@/lib/types";

export function AppHeader({
  user,
  title,
  subtitle,
  backHref,
}: {
  user: SessionUser;
  title: string;
  subtitle?: string;
  backHref?: string;
}) {
  return (
    <header className="mb-5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        {backHref ? (
          <Link href={backHref} className="label-text mb-2 inline-block">
            ← BACK
          </Link>
        ) : null}
        <p className="label-text mb-1">AKUL BROS</p>
        <h1 className="page-heading truncate">{title}</h1>
        {subtitle ? <p className="mt-1 text-[13px] text-[var(--color-muted)]">{subtitle}</p> : null}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        {user.role === "admin" ? (
          <Link href="/admin" className="btn btn-secondary min-h-10 px-3 text-[13px]">
            ADMIN
          </Link>
        ) : null}
        <form action={logout}>
          <button type="submit" className="btn btn-ghost min-h-10 px-3 text-[13px]">
            LOG OUT
          </button>
        </form>
      </div>
    </header>
  );
}
