import { STORE } from "@/constant";
import { dashboardFr } from "@/lib/dashboard/fr";
import { getOpeningHours, getStoreConfig } from "@/lib/db/store";
import { DashboardForm } from "../_components/DashboardForm";
import {
  DashboardTextarea,
  DashboardTextField,
} from "../_components/FormFields";
import { DashboardSubmitButton } from "../_components/DashboardSubmitButton";
import { OpeningHoursDayRow } from "../_components/OpeningHoursDayRow";
import { updateStoreConfigAction } from "../actions";

export default async function StoreConfigPage({ params }: { params: { token: string } }) {
  const token = params.token;
  const dbConfig = await getStoreConfig();
  const dbHours = await getOpeningHours();

  const config =
    dbConfig ??
    ({
      id: "main",
      name: STORE.name,
      category: STORE.category,
      description: STORE.description,
      location: {
        city: STORE.location.city,
        country: STORE.location.country,
        display: STORE.location.display,
      },
      email: STORE.email,
      phone: STORE.phone,
    } as const);

  const hours =
    dbHours.length > 0
      ? dbHours
      : STORE.openingHours.map((hour, index) => ({
          day: hour.day,
          order: index,
          label: hour.label,
          opensAt: hour.opensAt,
          closesAt: hour.closesAt,
        }));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs tracking-[0.3em] uppercase text-[var(--muted)] mb-2">
          {dashboardFr.store.accent}
        </p>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-wider">{dashboardFr.store.title}</h2>
      </div>

      <DashboardForm action={updateStoreConfigAction.bind(null, token)} className="grid gap-6">
        <div className="grid gap-4 border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
            {dashboardFr.store.sections.identity}
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <DashboardTextField label={dashboardFr.store.fields.nameFr} name="nameFr" defaultValue={config.name.fr} />
            <DashboardTextField label={dashboardFr.store.fields.nameEn} name="nameEn" defaultValue={config.name.en} />
            <DashboardTextField label={dashboardFr.store.fields.nameTr} name="nameTr" defaultValue={config.name.tr} />
            <DashboardTextField
              label={dashboardFr.store.fields.categoryFr}
              name="categoryFr"
              defaultValue={config.category.fr}
            />
            <DashboardTextField
              label={dashboardFr.store.fields.categoryEn}
              name="categoryEn"
              defaultValue={config.category.en}
            />
            <DashboardTextField
              label={dashboardFr.store.fields.categoryTr}
              name="categoryTr"
              defaultValue={config.category.tr}
            />
            <DashboardTextField
              label={dashboardFr.store.fields.locationCity}
              name="locationCity"
              defaultValue={config.location.city}
            />
            <DashboardTextField
              label={dashboardFr.store.fields.locationCountry}
              name="locationCountry"
              defaultValue={config.location.country}
            />
            <DashboardTextField
              label={dashboardFr.store.fields.locationFr}
              name="locationFr"
              defaultValue={config.location.display.fr}
            />
            <DashboardTextField
              label={dashboardFr.store.fields.locationEn}
              name="locationEn"
              defaultValue={config.location.display.en}
            />
            <DashboardTextField
              label={dashboardFr.store.fields.locationTr}
              name="locationTr"
              defaultValue={config.location.display.tr}
            />
            <DashboardTextField
              label={dashboardFr.store.fields.email}
              name="email"
              defaultValue={config.email}
              type="email"
            />
            <DashboardTextField
              label={dashboardFr.store.fields.phone}
              name="phone"
              defaultValue={config.phone}
              type="tel"
            />
          </div>
        </div>

        <div className="grid gap-4 border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
            {dashboardFr.store.sections.descriptions}
          </p>
          <DashboardTextarea
            label={dashboardFr.store.fields.descriptionFr}
            name="descriptionFr"
            defaultValue={config.description.fr}
          />
          <DashboardTextarea
            label={dashboardFr.store.fields.descriptionEn}
            name="descriptionEn"
            defaultValue={config.description.en}
          />
          <DashboardTextarea
            label={dashboardFr.store.fields.descriptionTr}
            name="descriptionTr"
            defaultValue={config.description.tr}
          />
        </div>

        <div className="border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4">
          <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-4">
            {dashboardFr.store.sections.openingHours}
          </p>
          <p className="text-sm text-[var(--muted)]">{dashboardFr.store.hints.openingHours}</p>
          <div className="grid gap-3 lg:grid-cols-2">
            {hours.map((hour) => (
              <OpeningHoursDayRow key={hour.day} hour={hour} />
            ))}
          </div>
        </div>

        <DashboardSubmitButton
          label={dashboardFr.store.save}
          pendingLabel={dashboardFr.loading.saving}
        />
      </DashboardForm>
    </div>
  );
}
