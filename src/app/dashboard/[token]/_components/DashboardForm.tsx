"use client";

import { useTransition } from "react";
import { FormPendingProvider } from "./FormPendingContext";

type DashboardFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  children: React.ReactNode;
  className?: string;
};

export function DashboardForm({ action, children, className }: DashboardFormProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className={className}
      aria-busy={isPending}
      action={(formData) => {
        startTransition(async () => {
          await action(formData);
        });
      }}
    >
      <FormPendingProvider pending={isPending}>
        <fieldset disabled={isPending} className="contents min-w-0 border-0 p-0 m-0">
          {children}
        </fieldset>
      </FormPendingProvider>
    </form>
  );
}
