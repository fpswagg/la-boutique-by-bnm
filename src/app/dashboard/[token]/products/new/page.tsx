import { createProduct } from "../../actions";
import { dashboardFr } from "@/lib/dashboard/fr";
import { DashboardForm } from "../../_components/DashboardForm";
import { DashboardSelect, DashboardTextField } from "../../_components/FormFields";
import { DashboardSubmitButton } from "../../_components/DashboardSubmitButton";
import { ImageFilePicker } from "../../_components/ImageFilePicker";

export default function NewProductPage({ params }: { params: { token: string } }) {
  const token = params.token;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs tracking-[0.3em] uppercase text-[var(--muted)] mb-2">
          {dashboardFr.productForm.createAccent}
        </p>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-wider">
          {dashboardFr.productForm.createTitle}
        </h2>
      </div>

      <DashboardForm action={createProduct.bind(null, token)} className="grid gap-6">
        <div className="grid gap-4 border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
            {dashboardFr.productForm.sections.identification}
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <DashboardTextField
              label={dashboardFr.productForm.fields.idOptional}
              name="id"
              required={false}
              hint={dashboardFr.productForm.fields.idOptionalHint}
            />
            <DashboardTextField
              label={dashboardFr.productForm.fields.currency}
              name="currency"
              defaultValue="FCFA"
              hint={dashboardFr.productForm.fields.currencyHint}
            />
            <DashboardSelect
              label={dashboardFr.productForm.fields.status}
              name="status"
              defaultValue="published"
              hint={dashboardFr.productForm.fields.statusHint}
              options={[
                { value: "published", label: dashboardFr.productForm.status.published },
                { value: "archived", label: dashboardFr.productForm.status.archived },
              ]}
            />
          </div>
        </div>

        <div className="grid gap-4 border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
            {dashboardFr.productForm.sections.translations}
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <DashboardTextField label={dashboardFr.productForm.fields.nameFr} name="nameFr" />
            <DashboardTextField label={dashboardFr.productForm.fields.nameEn} name="nameEn" />
            <DashboardTextField label={dashboardFr.productForm.fields.nameTr} name="nameTr" />
            <DashboardTextField label={dashboardFr.productForm.fields.categoryFr} name="categoryFr" />
            <DashboardTextField label={dashboardFr.productForm.fields.categoryEn} name="categoryEn" />
            <DashboardTextField label={dashboardFr.productForm.fields.categoryTr} name="categoryTr" />
          </div>
        </div>

        <div className="grid gap-4 border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
            {dashboardFr.productForm.sections.priceStock}
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <DashboardTextField
              label={dashboardFr.productForm.fields.price}
              name="price"
              required={false}
              type="number"
              hint={dashboardFr.productForm.fields.priceHint}
            />
            <DashboardTextField
              label={dashboardFr.productForm.fields.stock}
              name="stock"
              defaultValue={10}
              type="number"
            />
          </div>
        </div>

        <div className="grid gap-4 border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
            {dashboardFr.productForm.sections.tags}
          </p>
          <DashboardTextField
            label={dashboardFr.productForm.fields.tags}
            name="tags"
            required={false}
            placeholder={dashboardFr.productForm.placeholders.tags}
            hint={dashboardFr.productForm.fields.tagsHint}
          />
        </div>

        <ImageFilePicker name="images" />

        <DashboardSubmitButton
          label={dashboardFr.productForm.actions.create}
          pendingLabel={dashboardFr.loading.creating}
        />
      </DashboardForm>
    </div>
  );
}
