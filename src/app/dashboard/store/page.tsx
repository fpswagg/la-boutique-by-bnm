import { dashboardFr } from "@/lib/dashboard/fr";
import { dashStore, requireDash } from "@/lib/dashboard";
import { obj, str } from "@/lib/sss";
import { DashboardForm } from "../_components/DashboardForm";
import { DashboardTextarea, DashboardTextField } from "../_components/FormFields";
import { DashboardSubmitButton } from "../_components/DashboardSubmitButton";
import { OpeningHoursDayRow } from "../_components/OpeningHoursDayRow";
import { updateStoreConfigAction } from "../actions";

const f = dashboardFr.store.fields;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-4 border border-[var(--border)] bg-[var(--surface)] p-5">
      <p className="text-xs uppercase tracking-widest text-[var(--muted)]">{title}</p>
      {children}
    </div>
  );
}

export default async function StoreConfigPage({ searchParams }: { searchParams: { saved?: string } }) {
  const ctx = await requireDash();
  const store = await dashStore(ctx);
  const meta = store.meta;
  const i18n = obj(meta.i18n);
  const en = obj(i18n.en);
  const tr = obj(i18n.tr);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs tracking-[0.3em] uppercase text-[var(--muted)] mb-2">{dashboardFr.store.accent}</p>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-wider">{dashboardFr.store.title}</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Ces infos sont celles de la boutique dans SSS : les changer ici les change aussi là-bas.</p>
        {searchParams.saved && <p className="mt-4 text-sm text-green-600">Enregistré dans SSS. La boutique est à jour.</p>}
      </div>

      {!ctx.canWrite && <p className="text-sm text-[var(--muted)]">{dashboardFr.auth.readOnly}</p>}

      <DashboardForm action={updateStoreConfigAction} className="grid gap-6">
        <Section title={dashboardFr.store.sections.identity}>
          <div className="grid md:grid-cols-3 gap-4">
            <DashboardTextField label="Nom" name="nameFr" defaultValue={store.name} />
            <DashboardTextField label={f.email} name="email" required={false} defaultValue={store.email} type="email" />
            <DashboardTextField label={f.phone} name="phone" required={false} defaultValue={store.phone} type="tel" />
            <DashboardTextField label={f.whatsapp} name="whatsapp" required={false} defaultValue={store.whatsapp} type="tel" />
            <DashboardTextField label={f.locationCity} name="locationCity" defaultValue={store.city} />
            <DashboardTextField label={f.locationCountry} name="locationCountry" defaultValue={store.country} />
            <DashboardTextField label={f.categoryFr} name="categoryFr" defaultValue={str(meta.category)} />
            <DashboardTextField label={f.categoryEn} name="categoryEn" required={false} defaultValue={str(en.category)} />
            <DashboardTextField label={f.categoryTr} name="categoryTr" required={false} defaultValue={str(tr.category)} />
            <DashboardTextField label={f.locationFr} name="locationFr" required={false} defaultValue={str(meta.locationDisplay)} />
            <DashboardTextField label={f.locationEn} name="locationEn" required={false} defaultValue={str(en.location)} />
            <DashboardTextField label={f.locationTr} name="locationTr" required={false} defaultValue={str(tr.location)} />
          </div>
        </Section>

        <Section title={dashboardFr.store.sections.descriptions}>
          <DashboardTextarea label={f.descriptionFr} name="descriptionFr" defaultValue={store.description} />
          <div className="grid md:grid-cols-2 gap-4">
            <DashboardTextarea label={f.descriptionEn} name="descriptionEn" defaultValue={str(en.description)} />
            <DashboardTextarea label={f.descriptionTr} name="descriptionTr" defaultValue={str(tr.description)} />
          </div>
          <DashboardTextarea label={f.deliveryFr} name="deliveryFr" rows={3} defaultValue={str(meta.delivery)} />
          <div className="grid md:grid-cols-2 gap-4">
            <DashboardTextarea label={f.deliveryEn} name="deliveryEn" rows={3} defaultValue={str(en.delivery)} />
            <DashboardTextarea label={f.deliveryTr} name="deliveryTr" rows={3} defaultValue={str(tr.delivery)} />
          </div>
        </Section>

        <div className="border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4">
          <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-4">{dashboardFr.store.sections.openingHours}</p>
          <p className="text-sm text-[var(--muted)]">{dashboardFr.store.hints.openingHours}</p>
          <div className="grid gap-3 lg:grid-cols-2">
            {store.hours.map((hour) => (
              <OpeningHoursDayRow key={hour.day} hour={hour} />
            ))}
          </div>
        </div>

        {ctx.canWrite && <DashboardSubmitButton label={dashboardFr.store.save} pendingLabel={dashboardFr.loading.saving} />}
      </DashboardForm>
    </div>
  );
}
