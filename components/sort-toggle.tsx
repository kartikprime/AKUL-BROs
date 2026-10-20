import type { CustomerSort } from "@/lib/types";

export function SortToggle({
  value,
  onChange,
}: {
  value: CustomerSort;
  onChange: (value: CustomerSort) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        className={`btn min-h-11 text-[13px] ${value === "modified" ? "btn-primary" : "btn-secondary"}`}
        onClick={() => onChange("modified")}
      >
        LAST MODIFIED
      </button>
      <button
        type="button"
        className={`btn min-h-11 text-[13px] ${value === "alpha" ? "btn-primary" : "btn-secondary"}`}
        onClick={() => onChange("alpha")}
      >
        A TO Z
      </button>
    </div>
  );
}
