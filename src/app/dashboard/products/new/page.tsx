import { createProduct } from "../../actions";
import { dashboardFr } from "@/lib/dashboard/fr";
import { dashProducts, requireDash } from "@/lib/dashboard";
import { DashboardForm } from "../../_components/DashboardForm";
import { DashboardSubmitButton } from "../../_components/DashboardSubmitButton";
import { ImageFilePicker } from "../../_components/ImageFilePicker";
import { ProductFields } from "../../_components/ProductFields";

export default async function NewProductPage() {
  const ctx = await requireDash();
  const products = await dashProducts(ctx);
  const categories = Array.from(new Set(products.map((p) => p.category.fr).filter(Boolean))).sort();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs tracking-[0.3em] uppercase text-[var(--muted)] mb-2">{dashboardFr.productForm.createAccent}</p>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-wider">{dashboardFr.productForm.createTitle}</h2>
      </div>

      {!ctx.canWrite ? (
        <p className="text-sm text-[var(--muted)]">{dashboardFr.auth.readOnly}</p>
      ) : (
        <DashboardForm action={createProduct} className="grid gap-6">
          <ProductFields categories={categories} />
          <ImageFilePicker name="images" />
          <DashboardSubmitButton label={dashboardFr.productForm.actions.create} pendingLabel={dashboardFr.loading.creating} />
        </DashboardForm>
      )}
    </div>
  );
}
