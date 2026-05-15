"use client";

import { dashboardFr } from "@/lib/dashboard/fr";
import { DashboardForm } from "./DashboardForm";
import { DashboardSubmitButton } from "./DashboardSubmitButton";

type ProductDuplicateFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  buttonClassName?: string;
};

export function ProductDuplicateForm({ action, buttonClassName }: ProductDuplicateFormProps) {
  return (
    <DashboardForm action={action}>
      <DashboardSubmitButton
        label={dashboardFr.products.duplicate}
        pendingLabel={dashboardFr.loading.duplicating}
        variant="compact"
        className={buttonClassName}
      />
    </DashboardForm>
  );
}
