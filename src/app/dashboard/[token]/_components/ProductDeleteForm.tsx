"use client";

import { dashboardFr } from "@/lib/dashboard/fr";
import { DashboardForm } from "./DashboardForm";
import { DashboardSubmitButton } from "./DashboardSubmitButton";

type ProductDeleteFormProps = {
  action: (formData: FormData) => void | Promise<void>;
};

export function ProductDeleteForm({ action }: ProductDeleteFormProps) {
  return (
    <DashboardForm action={action}>
      <DashboardSubmitButton
        label={dashboardFr.products.delete}
        pendingLabel={dashboardFr.loading.deleting}
        variant="compact"
      />
    </DashboardForm>
  );
}
