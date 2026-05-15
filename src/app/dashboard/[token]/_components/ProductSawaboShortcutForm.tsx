"use client";

import { dashboardFr } from "@/lib/dashboard/fr";
import { DashboardForm } from "./DashboardForm";
import { DashboardSubmitButton } from "./DashboardSubmitButton";

type ProductSawaboShortcutFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  label?: string;
};

export function ProductSawaboShortcutForm({
  action,
  label = dashboardFr.products.postToSawabo,
}: ProductSawaboShortcutFormProps) {
  return (
    <DashboardForm action={action}>
      <DashboardSubmitButton
        label={label}
        pendingLabel={dashboardFr.loading.postingSawabo}
        variant="compact"
      />
    </DashboardForm>
  );
}
