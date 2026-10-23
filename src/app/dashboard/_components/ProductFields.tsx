import type { ProductRecord } from "@/lib/sss";
import { dashboardFr } from "@/lib/dashboard/fr";
import { DashboardSelect, DashboardTextarea, DashboardTextField } from "./FormFields";

const f = dashboardFr.productForm.fields;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-4 border border-[var(--border)] bg-[var(--surface)] p-5">
      <p className="text-xs uppercase tracking-widest text-[var(--muted)]">{title}</p>
      {children}
    </div>
  );
}

/** Product editor fields, shared by "new" and "edit". FR is the main language (also used in SSS). */
export function ProductFields({ product, categories }: { product?: ProductRecord; categories: string[] }) {
  return (
    <>
      <Section title={dashboardFr.productForm.sections.identification}>
        <div className="grid md:grid-cols-3 gap-4">
          <DashboardTextField
            label={product ? f.idRequired : f.idOptional}
            name="id"
            required={Boolean(product)}
            defaultValue={product?.id}
            hint={product ? f.idRequiredHint : f.idOptionalHint}
          />
          <DashboardTextField label={f.currency} name="currency" defaultValue={product?.currency ?? "FCFA"} hint={f.currencyHint} />
          <DashboardSelect
            label={f.status}
            name="status"
            defaultValue={product?.status ?? "published"}
            hint={f.statusHint}
            options={[
              { value: "published", label: dashboardFr.productForm.status.published },
              { value: "archived", label: dashboardFr.productForm.status.archived },
            ]}
          />
        </div>
      </Section>

      <Section title={dashboardFr.productForm.sections.translations}>
        <div className="grid md:grid-cols-3 gap-4">
          <DashboardTextField label={f.nameFr} name="nameFr" defaultValue={product?.name.fr} />
          <DashboardTextField label={f.nameEn} name="nameEn" required={false} defaultValue={product?.name.en} hint={f.translationHint} />
          <DashboardTextField label={f.nameTr} name="nameTr" required={false} defaultValue={product?.name.tr} hint={f.translationHint} />
          <DashboardTextField label={f.categoryFr} name="categoryFr" defaultValue={product?.category.fr} hint={categories.length ? `${f.categoriesHint} ${categories.join(", ")}` : undefined} />
          <DashboardTextField label={f.categoryEn} name="categoryEn" required={false} defaultValue={product?.category.en} />
          <DashboardTextField label={f.categoryTr} name="categoryTr" required={false} defaultValue={product?.category.tr} />
        </div>
        <DashboardTextarea label={f.descriptionFr} name="descriptionFr" rows={4} defaultValue={product?.description.fr} />
        <div className="grid md:grid-cols-2 gap-4">
          <DashboardTextarea label={f.descriptionEn} name="descriptionEn" rows={4} defaultValue={product?.description.en} />
          <DashboardTextarea label={f.descriptionTr} name="descriptionTr" rows={4} defaultValue={product?.description.tr} />
        </div>
      </Section>

      <Section title={dashboardFr.productForm.sections.priceStock}>
        <div className="grid md:grid-cols-2 gap-4">
          <DashboardTextField label={f.price} name="price" required={false} defaultValue={product?.price ?? ""} type="number" hint={f.priceHint} />
          <DashboardTextField label={f.stock} name="stock" defaultValue={product?.stock ?? 1} type="number" />
        </div>
      </Section>

      <Section title={dashboardFr.productForm.sections.showcase}>
        <div className="grid md:grid-cols-3 gap-4">
          <DashboardTextField label={f.badge} name="badge" required={false} defaultValue={product?.badge} hint={f.badgeHint} />
          <DashboardTextField label={f.order} name="order" required={false} type="number" defaultValue={product && product.order !== 999 ? product.order : ""} hint={f.orderHint} />
          <label className="flex items-center gap-2 text-sm self-center">
            <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} />
            <span>{f.featured}</span>
          </label>
        </div>
        <DashboardTextField
          label={f.tags}
          name="tags"
          required={false}
          defaultValue={product?.tags.join(", ")}
          placeholder={dashboardFr.productForm.placeholders.tags}
          hint={f.tagsHint}
        />
      </Section>
    </>
  );
}
