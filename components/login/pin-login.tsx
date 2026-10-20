"use client";

import { useState, useTransition } from "react";
import { loginWithPin } from "@/lib/actions/auth";
import { ErrorBanner } from "@/components/error-banner";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "←"];

export function PinLogin() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function press(key: string) {
    setError(null);
    if (key === "C") {
      setPin("");
      return;
    }
    if (key === "←") {
      setPin((current) => current.slice(0, -1));
      return;
    }
    setPin((current) => (current.length < 4 ? current + key : current));
  }

  function submit() {
    if (pin.length !== 4) {
      setError("ENTER A 4 DIGIT PASSWORD.");
      return;
    }
    startTransition(async () => {
      const result = await loginWithPin(pin);
      if (result?.error) {
        setError(result.error);
        setPin("");
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <div className="mb-8 text-center">
        <p className="label-text mb-2">DAIRY ACCOUNTING</p>
        <h1 className="page-heading">AKUL BROS</h1>
        <p className="mt-3 text-[13px] text-[var(--color-muted)]">
          ENTER THE 4 DIGIT PASSWORD
        </p>
      </div>

      <div className="card p-5">
        <div className="mb-6 flex justify-center gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <span
              key={index}
              className="flex h-14 w-12 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[#f8fbff] text-2xl font-bold"
            >
              {pin[index] ? "•" : ""}
            </span>
          ))}
        </div>

        <ErrorBanner message={error} />

        <div className="mt-4 grid grid-cols-3 gap-3">
          {KEYS.map((key) => (
            <button
              key={key}
              type="button"
              className="btn btn-secondary h-16 text-xl"
              onClick={() => press(key)}
              disabled={pending}
            >
              {key}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="btn btn-primary mt-4 w-full"
          onClick={submit}
          disabled={pending}
        >
          {pending ? "CHECKING..." : "ENTER"}
        </button>
      </div>
    </div>
  );
}
