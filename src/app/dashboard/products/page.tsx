import { deleteProduct, duplicateProduct, setProductStockFromForm } from "../actions";
import { dashProducts, requireDash } from "@/lib/dashboard";
import { dashboardFr, productStatusLabelFr } from "@/lib/dashboard/fr";
import { DashboardNavLink } from "../_components/DashboardNavLink";
import { DashboardSortLink } from "../_components/DashboardSortLink";
import { ProductDeleteForm } from "../_components/ProductDeleteForm";
import { ProductDuplicateForm } from "../_components/ProductDuplicateForm";
import { ProductStockToggle } from "../_components/ProductStockToggle";

export default async function DashboardProductsPage({
  searchParams: _searchParams,
}: {
  searchParams?: Promise<{ sort?: string; dir?: "asc" | "desc"; q?: string }>;
}) {
  const searchParams = await _searchParams;
  const ctx = await requireDash();
  const q = (searchParams?.q ?? "").trim().toLowerCase();
  const sort = searchParams?.sort ?? "postedAt";
  const dir = searchParams?.dir === "asc" ? "asc" : "desc";

  const all = await dashProducts(ctx);
  const products = q
    ? all.filter((p) => [p.name.fr, p.id, p.category.fr, ...p.tags].some((v) => v.toLowerCase().includes(q)))
    : all;
  const sorted = [...products].sort((a, b) => {
    const factor = dir === "asc" ? 1 : -1;
    if (sort === "name") return a.name.fr.localeCompare(b.name.fr) * factor;
    if (sort === "price") return ((a.price ?? 0) - (b.price ?? 0)) * factor;
    if (sort === "stock") return (a.stock - b.stock) * factor;
    if (sort === "views") return (a.views - b.views) * factor;
    return (a.postedAt.getTime() - b.postedAt.getTime()) * factor;
  });

  const sortItems = [
    { key: "postedAt", label: dashboardFr.products.sort.date },
    { key: "name", label: dashboardFr.products.sort.name },
    { key: "price", label: dashboardFr.products.sort.price },
    { key: "stock", label: dashboardFr.products.sort.stock },
    { key: "views", label: dashboardFr.products.sort.views },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-[var(--muted)] mb-2">
            {dashboardFr.products.accent}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-wider">
            {dashboardFr.products.title}
          </h2>
        </div>
        <DashboardNavLink
          href={"/dashboard/products/new"}
          label={dashboardFr.products.newProduct}
          match="prefix"
          className="shrink-0 self-start sm:self-auto px-4 py-2 border border-[var(--border)] hover:border-[var(--fg)]"
        />
      </div>

      <form className="flex gap-2" action="/dashboard/products">
        <input
          name="q"
          defaultValue={searchParams?.q ?? ""}
          placeholder={dashboardFr.products.search}
          className="min-h-10 flex-1 max-w-sm px-3 border border-[var(--border)] bg-[var(--surface)] text-sm"
        />
        <button type="submit" className="px-3 border border-[var(--border)] text-xs uppercase tracking-widest">
          OK
        </button>
      </form>

      <div className="flex flex-wrap gap-2 text-xs uppercase tracking-widest">
        {sortItems.map((item) => (
          <DashboardSortLink
            key={item.key}
            href={`?sort=${item.key}&dir=${sort === item.key && dir === "asc" ? "desc" : "asc"}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            label={item.label}
            active={sort === item.key}
          />
        ))}
      </div>

      <div className="overflow-x-auto border border-[var(--border)]">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-left border-b border-[var(--border)]">
              <th className="py-3 px-3">{dashboardFr.products.table.product}</th>
              <th className="py-3 px-3">{dashboardFr.products.table.price}</th>
              <th className="py-3 px-3">{dashboardFr.products.table.stock}</th>
              <th className="py-3 px-3">{dashboardFr.products.table.status}</th>
              <th className="py-3 px-3">{dashboardFr.overview.cards.views}</th>
              <th className="py-3 px-3">{dashboardFr.products.table.posted}</th>
              <th className="py-3 px-3">{dashboardFr.products.table.actions}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((product) => (
              <tr key={product.sssId} className="border-b border-[var(--border)]/60 last:border-0">
                <td className="py-3 px-3">
                  <p className="font-medium">{product.name.fr}</p>
                  <p className="text-xs text-[var(--muted)]">{product.id}</p>
                </td>
                <td className="py-3 px-3">
                  {product.price === null
                    ? dashboardFr.products.onRequest
                    : `${product.price.toLocaleString("fr-FR")} ${product.currency}`}
                </td>
                <td className="py-3 px-3">
                  <ProductStockToggle
                    action={setProductStockFromForm.bind(null, product.sssId)}
                    stock={product.stock}
                  />
                </td>
                <td className="py-3 px-3">
                  <span className="px-2 py-1 border border-[var(--border)] text-xs uppercase tracking-wider">
                    {productStatusLabelFr(product.status)}
                  </span>
                  {product.featured ? <span className="ml-1 text-xs">★</span> : null}
                </td>
                <td className="py-3 px-3">{product.views}</td>
                <td className="py-3 px-3">{product.postedAt.toLocaleDateString("fr-FR")}</td>
                <td className="py-3 px-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <DashboardNavLink
                      href={`/dashboard/products/${product.sssId}`}
                      label={dashboardFr.products.edit}
                      match="prefix"
                      className="px-2 py-1 border border-[var(--border)] hover:border-[var(--fg)] text-xs"
                    />
                    <ProductDuplicateForm action={duplicateProduct.bind(null, product.sssId)} />
                    <ProductDeleteForm action={deleteProduct.bind(null, product.sssId)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
