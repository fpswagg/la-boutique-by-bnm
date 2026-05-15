"use client";

import { dashboardFr } from "@/lib/dashboard/fr";
import { DashboardForm } from "./DashboardForm";
import { DashboardSpinner } from "./DashboardSpinner";
import { useFormPending } from "./FormPendingContext";

type StockOptionFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  value: 0 | 1;
  label: string;
  active: boolean;
};

function StockOptionForm({ action, value, label, active }: StockOptionFormProps) {
  return (
    <DashboardForm action={action} className="inline-block">
      <StockOptionButton value={value} label={label} active={active} />
    </DashboardForm>
  );
}

function StockOptionButton({
  value,
  label,
  active,
}: {
  value: 0 | 1;
  label: string;
  active: boolean;
}) {
  const isPending = useFormPending();

  return (
    <>
      <input type="hidden" name="stock" value={String(value)} />
      <button
        type="submit"
        disabled={isPending}
        aria-pressed={active}
        className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs uppercase tracking-wider border transition-opacity disabled:opacity-50 ${
          active
            ? "border-[var(--fg)] bg-[var(--surface-2)]"
            : "border-[var(--border)] hover:border-[var(--fg)]"
        }`}
      >
        {isPending ? <DashboardSpinner size="sm" /> : null}
        <span>{label}</span>
      </button>
    </>
  );
}

type ProductStockToggleProps = {
  action: (formData: FormData) => void | Promise<void>;
  stock: number;
};

export function ProductStockToggle({ action, stock }: ProductStockToggleProps) {
  const inStock = stock > 0;

  return (
    <div className="inline-flex flex-wrap gap-1">
      <StockOptionForm
        action={action}
        value={1}
        label={dashboardFr.products.stockIn}
        active={inStock}
      />
      <StockOptionForm
        action={action}
        value={0}
        label={dashboardFr.products.stockOut}
        active={!inStock}
      />
    </div>
  );
}
