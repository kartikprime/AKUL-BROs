"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { createCustomer, deleteCustomer } from "@/lib/actions/customers";
import { ErrorBanner } from "@/components/error-banner";
import { SortToggle } from "@/components/sort-toggle";
import { formatCustomerLabel } from "@/lib/format";
import type { Customer, CustomerSort } from "@/lib/types";

export function CustomerManager({
  villageId,
  villageName,
  initialCustomers,
}: {
  villageId: string;
  villageName: string;
  initialCustomers: Customer[];
}) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [sort, setSort] = useState<CustomerSort>("modified");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const sorted = useMemo(() => {
    const copy = [...customers];
    copy.sort((a, b) => {
      if (sort === "alpha") {
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    return copy;
  }, [customers, sort]);

  function addCustomer() {
    startTransition(async () => {
      setError(null);
      const result = await createCustomer({ villageId, name });
      if (result.error) {
        setError(result.error);
        return;
      }
      if (!result.customer) return;
      const customer = result.customer;
      setCustomers((current) => [customer, ...current]);
      setName("");
    });
  }

  function removeCustomer(id: string) {
    startTransition(async () => {
      setError(null);
      const result = await deleteCustomer(id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setCustomers((current) => current.filter((customer) => customer.id !== id));
    });
  }

  return (
    <div className="space-y-4">
      <section className="card p-4">
        <h2 className="section-heading mb-4">ADD CUSTOMER</h2>
        <p className="mb-3 text-[13px] text-[var(--color-muted)]">VILLAGE: {villageName}</p>
        <label className="mb-3 block">
          <span className="label-text mb-2 block">CUSTOMER NAME</span>
          <input className="field" value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <button type="button" className="btn btn-primary w-full" onClick={addCustomer} disabled={pending}>
          {pending ? "SAVING..." : "SAVE CUSTOMER"}
        </button>
      </section>

      <SortToggle value={sort} onChange={setSort} />
      <ErrorBanner message={error} />

      {sorted.length === 0 ? (
        <div className="card px-4 py-8 text-center text-[var(--color-muted)]">NO CUSTOMERS YET</div>
      ) : (
        sorted.map((customer) => (
          <article key={customer.id} className="card p-4">
            <Link href={`/villages/${villageId}/customers/${customer.id}`} className="block">
              <span className="inline-flex rounded-full bg-[#dbeafe] px-3 py-1 text-[12px] font-semibold text-[var(--color-deep)]">
                {customer.customerNumber}
              </span>
              <h2 className="section-heading mt-2">
                {formatCustomerLabel(customer.customerNumber, customer.name)}
              </h2>
            </Link>
            <button
              type="button"
              className="btn btn-danger mt-4 w-full"
              onClick={() => removeCustomer(customer.id)}
              disabled={pending}
            >
              DELETE
            </button>
          </article>
        ))
      )}
    </div>
  );
}
