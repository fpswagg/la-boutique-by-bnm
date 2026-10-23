"use client";

import { dashboardFr } from "@/lib/dashboard/fr";
import { DashboardForm } from "./DashboardForm";
import { DashboardSubmitButton } from "./DashboardSubmitButton";

type DeleteImageFormProps = {
  action: (formData: FormData) => void | Promise<void>;
};

export function DeleteImageForm({ action }: DeleteImageFormProps) {
  return (
    <DashboardForm action={action} className="mt-2">
      <DashboardSubmitButton
        label={dashboardFr.productForm.actions.deleteImage}
        pendingLabel={dashboardFr.loading.deletingImage}
        variant="compact"
        className="w-full"
      />
    </DashboardForm>
  );
}
