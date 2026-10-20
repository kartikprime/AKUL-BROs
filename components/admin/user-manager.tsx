"use client";

import { useState, useTransition } from "react";
import { createAppUser, deleteAppUser } from "@/lib/actions/users";
import { ErrorBanner } from "@/components/error-banner";
import type { AppUserListItem, UserRole } from "@/lib/types";

export function UserManager({
  currentUserId,
  initialUsers,
}: {
  currentUserId: string;
  initialUsers: AppUserListItem[];
}) {
  const [users, setUsers] = useState(initialUsers);
  const [pin, setPin] = useState("");
  const [role, setRole] = useState<UserRole>("owner");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function addUser() {
    startTransition(async () => {
      setError(null);
      setMessage(null);
      const result = await createAppUser(pin, role);
      if (result.error) {
        setError(result.error);
        return;
      }
      setPin("");
      setMessage("USER PASSWORD SAVED.");
      window.location.reload();
    });
  }

  function removeUser(id: string) {
    startTransition(async () => {
      setError(null);
      const result = await deleteAppUser(id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setUsers((current) => current.filter((user) => user.id !== id));
    });
  }

  return (
    <div className="space-y-4">
      <section className="card p-4">
        <h2 className="section-heading mb-4">ADD 4 DIGIT PASSWORD</h2>
        <label className="mb-3 block">
          <span className="label-text mb-2 block">PASSWORD</span>
          <input
            className="field"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
          />
        </label>
        <label className="mb-3 block">
          <span className="label-text mb-2 block">ROLE</span>
          <select className="field" value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
            <option value="owner">OWNER</option>
            <option value="admin">ADMIN</option>
          </select>
        </label>
        <ErrorBanner message={error} />
        {message ? <p className="mb-3 text-[13px] font-semibold text-[var(--color-success)]">{message}</p> : null}
        <button type="button" className="btn btn-primary w-full" onClick={addUser} disabled={pending}>
          {pending ? "SAVING..." : "SAVE PASSWORD"}
        </button>
      </section>

      {users.map((user) => (
        <article key={user.id} className="card p-4">
          <p className="label-text">{user.role}</p>
          <p className="mt-2 text-[13px] text-[var(--color-muted)]">CREATED {user.createdAt.slice(0, 10)}</p>
          {user.id === currentUserId ? (
            <p className="mt-3 text-[12px] text-[var(--color-muted)]">CURRENT ADMIN</p>
          ) : (
            <button
              type="button"
              className="btn btn-danger mt-4 w-full"
              onClick={() => removeUser(user.id)}
              disabled={pending}
            >
              DELETE
            </button>
          )}
        </article>
      ))}
    </div>
  );
}
