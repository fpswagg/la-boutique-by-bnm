import Image from "next/image";
import { redirect } from "next/navigation";
import { deleteImage, duplicateProduct, updateProduct } from "../../actions";
import { getProductById } from "@/lib/db/products";
import { dashboardFr, productImageAltFr } from "@/lib/dashboard/fr";
import { DeleteImageForm } from "../../_components/DeleteImageForm";
import { DashboardForm } from "../../_components/DashboardForm";
import { DashboardSelect, DashboardTextField } from "../../_components/FormFields";
import { DashboardSubmitButton } from "../../_components/DashboardSubmitButton";
import { ImageFilePicker } from "../../_components/ImageFilePicker";
import { ProductDuplicateForm } from "../../_components/ProductDuplicateForm";

export default async function EditProductPage({
  params,
}: {
  params: { token: string; id: string };
}) {
  const token = params.token;
  const product = await getProductById(params.id);

  if (!product) redirect(`/dashboard/${token}`);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs tracking-[0.3em] uppercase text-[var(--muted)] mb-2">
          {dashboardFr.productForm.editAccent}
        </p>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-wider">{product.name.fr}</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <ProductDuplicateForm
            action={duplicateProduct.bind(null, token, product.id)}
            buttonClassName="px-4 py-2 border border-[var(--border)] hover:border-[var(--fg)] text-xs uppercase tracking-widest"
          />
        </div>
      </div>

      <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-4">
          {dashboardFr.productForm.sections.currentImages}
        </p>
        {product.images.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">{dashboardFr.productForm.images.noImage}</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {product.images.map((imageUrl) => (
              <div key={imageUrl} className="border border-[var(--border)] p-2">
                <div className="relative aspect-square">
                  <Image
                    src={imageUrl}
                    alt={productImageAltFr(product.name.fr)}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                </div>
                <DeleteImageForm action={deleteImage.bind(null, token, product.id, imageUrl)} />
              </div>
            ))}
          </div>
        )}
      </div>

      <DashboardForm action={updateProduct.bind(null, token, product.id)} className="grid gap-6">
        <div className="grid gap-4 border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
            {dashboardFr.productForm.sections.identification}
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <DashboardTextField
              label={dashboardFr.productForm.fields.idRequired}
              name="id"
              defaultValue={product.id}
              hint={dashboardFr.productForm.fields.idRequiredHint}
            />
            <DashboardTextField
              label={dashboardFr.productForm.fields.currency}
              name="currency"
              defaultValue={product.currency}
              hint={dashboardFr.productForm.fields.currencyHint}
            />
            <DashboardSelect
              label={dashboardFr.productForm.fields.status}
              name="status"
              defaultValue={product.status}
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
            <DashboardTextField
              label={dashboardFr.productForm.fields.nameFr}
              name="nameFr"
              defaultValue={product.name.fr}
            />
            <DashboardTextField
              label={dashboardFr.productForm.fields.nameEn}
              name="nameEn"
              defaultValue={product.name.en}
            />
            <DashboardTextField
              label={dashboardFr.productForm.fields.nameTr}
              name="nameTr"
              defaultValue={product.name.tr}
            />
            <DashboardTextField
              label={dashboardFr.productForm.fields.categoryFr}
              name="categoryFr"
              defaultValue={product.category.fr}
            />
            <DashboardTextField
              label={dashboardFr.productForm.fields.categoryEn}
              name="categoryEn"
              defaultValue={product.category.en}
            />
            <DashboardTextField
              label={dashboardFr.productForm.fields.categoryTr}
              name="categoryTr"
              defaultValue={product.category.tr}
            />
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
              defaultValue={product.price ?? ""}
              type="number"
              hint={dashboardFr.productForm.fields.priceHint}
            />
            <DashboardTextField
              label={dashboardFr.productForm.fields.stock}
              name="stock"
              defaultValue={product.stock}
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
            defaultValue={product.tags.join(", ")}
            placeholder={dashboardFr.productForm.placeholders.tags}
            hint={dashboardFr.productForm.fields.tagsHint}
          />
        </div>

        {product.images.map((imageUrl) => (
          <input key={imageUrl} type="hidden" name="keepImages" value={imageUrl} />
        ))}

        <ImageFilePicker name="images" />

        <DashboardSubmitButton
          label={dashboardFr.productForm.actions.save}
          pendingLabel={dashboardFr.loading.saving}
        />
      </DashboardForm>
    </div>
  );
}
