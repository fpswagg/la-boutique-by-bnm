import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteImage, deleteProduct, duplicateProduct, updateProduct } from "../../actions";
import { dashboardFr, productImageAltFr } from "@/lib/dashboard/fr";
import { dashProduct, dashProducts, requireDash, viewsSince } from "@/lib/dashboard";
import { DeleteImageForm } from "../../_components/DeleteImageForm";
import { DashboardForm } from "../../_components/DashboardForm";
import { DashboardSubmitButton } from "../../_components/DashboardSubmitButton";
import { ImageFilePicker } from "../../_components/ImageFilePicker";
import { ProductDeleteForm } from "../../_components/ProductDeleteForm";
import { ProductDuplicateForm } from "../../_components/ProductDuplicateForm";
import { ProductFields } from "../../_components/ProductFields";

export default async function EditProductPage({
  params: _params,
  searchParams: _searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const params = await _params;
  const searchParams = await _searchParams;
  const ctx = await requireDash();
  const [product, all] = await Promise.all([dashProduct(ctx, decodeURIComponent(params.id)), dashProducts(ctx)]);
  if (!product) notFound();
  const categories = Array.from(new Set(all.map((p) => p.category.fr).filter(Boolean))).sort();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs tracking-[0.3em] uppercase text-[var(--muted)] mb-2">{dashboardFr.productForm.editAccent}</p>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-wider">{product.name.fr}</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {product.views} vues au total · {viewsSince(product, 7)} cette semaine ·{" "}
          <Link href={`/products/${encodeURIComponent(product.id)}`} target="_blank" className="underline">
            voir la fiche
          </Link>
        </p>
        {ctx.canWrite && (
          <div className="mt-4 flex flex-wrap gap-2">
            <ProductDuplicateForm
              action={duplicateProduct.bind(null, product.sssId)}
              buttonClassName="px-4 py-2 border border-[var(--border)] hover:border-[var(--fg)] text-xs uppercase tracking-widest"
            />
            <ProductDeleteForm action={deleteProduct.bind(null, product.sssId)} />
          </div>
        )}
        {searchParams.saved && <p className="mt-4 text-sm text-green-600">Enregistré dans SSS. La boutique est à jour.</p>}
      </div>

      <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-4">{dashboardFr.productForm.sections.currentImages}</p>
        {product.images.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">{dashboardFr.productForm.images.noImage}</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {product.images.map((imageUrl) => (
              <div key={imageUrl} className="border border-[var(--border)] p-2">
                <div className="relative aspect-square">
                  <Image src={imageUrl} alt={productImageAltFr(product.name.fr)} fill sizes="200px" className="object-cover" />
                </div>
                {ctx.canWrite && <DeleteImageForm action={deleteImage.bind(null, product.sssId, imageUrl)} />}
              </div>
            ))}
          </div>
        )}
      </div>

      {ctx.canWrite ? (
        <DashboardForm action={updateProduct.bind(null, product.sssId)} className="grid gap-6">
          <ProductFields product={product} categories={categories} />
          {product.images.map((imageUrl) => (
            <input key={imageUrl} type="hidden" name="keepImages" value={imageUrl} />
          ))}
          <ImageFilePicker name="images" />
          <DashboardSubmitButton label={dashboardFr.productForm.actions.save} pendingLabel={dashboardFr.loading.saving} />
        </DashboardForm>
      ) : (
        <p className="text-sm text-[var(--muted)]">{dashboardFr.auth.readOnly}</p>
      )}
    </div>
  );
}
