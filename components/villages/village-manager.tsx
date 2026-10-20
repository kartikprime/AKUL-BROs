"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createVillage, deleteVillage } from "@/lib/actions/villages";
import { ErrorBanner } from "@/components/error-banner";
import type { Village } from "@/lib/types";

export function VillageManager({ initialVillages }: { initialVillages: Village[] }) {
  const [villages, setVillages] = useState(initialVillages);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function addVillage() {
    startTransition(async () => {
      setError(null);
      const result = await createVillage({ name, code });
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if (!("village" in result) || !result.village) return;
      const village = result.village;
      setVillages((current) => [...current, village]);
      setName("");
      setCode("");
    });
  }

  function removeVillage(id: string) {
    startTransition(async () => {
      setError(null);
      const result = await deleteVillage(id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setVillages((current) => current.filter((village) => village.id !== id));
    });
  }

  return (
    <div className="space-y-4">
      <section className="card p-4">
        <h2 className="section-heading mb-4">ADD VILLAGE</h2>
        <div className="space-y-3">
          <label className="block">
            <span className="label-text mb-2 block">VILLAGE NAME</span>
            <input className="field" value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="block">
            <span className="label-text mb-2 block">VILLAGE CODE</span>
            <input className="field" value={code} onChange={(event) => setCode(event.target.value)} placeholder="V001" />
          </label>
          <ErrorBanner message={error} />
          <button type="button" className="btn btn-primary w-full" onClick={addVillage} disabled={pending}>
            {pending ? "SAVING..." : "SAVE VILLAGE"}
          </button>
        </div>
      </section>

      <section className="space-y-3">
        {villages.length === 0 ? (
          <div className="card px-4 py-8 text-center text-[var(--color-muted)]">
            NO VILLAGES YET
          </div>
        ) : (
          villages.map((village) => (
            <article key={village.id} className="card p-4">
              <Link href={`/villages/${village.id}`} className="block">
                <p className="label-text">VILLAGE CODE {village.code}</p>
                <h2 className="section-heading mt-1">{village.name}</h2>
              </Link>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link href={`/villages/${village.id}`} className="btn btn-primary">
                  OPEN
                </Link>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => removeVillage(village.id)}
                  disabled={pending}
                >
                  DELETE
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
