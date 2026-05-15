import { db } from "@/lib/db";

export interface StoreConfigRecord {
  id: string;
  name: { fr: string; en: string; tr: string };
  category: { fr: string; en: string; tr: string };
  description: { fr: string; en: string; tr: string };
  location: {
    city: string;
    country: string;
    display: { fr: string; en: string; tr: string };
  };
  email: string;
  phone: string;
}

export interface OpeningHourRecord {
  day: string;
  order: number;
  label: { fr: string; en: string; tr: string };
  opensAt: number;
  closesAt: number;
}

export async function getStoreConfig(): Promise<StoreConfigRecord | null> {
  const row = await db.storeConfig.findUnique({ where: { id: "main" } });
  if (!row) return null;

  return {
    id: row.id,
    name: { fr: row.nameFr, en: row.nameEn, tr: row.nameTr },
    category: { fr: row.categoryFr, en: row.categoryEn, tr: row.categoryTr },
    description: {
      fr: row.descriptionFr,
      en: row.descriptionEn,
      tr: row.descriptionTr,
    },
    location: {
      city: row.locationCity,
      country: row.locationCountry,
      display: { fr: row.locationFr, en: row.locationEn, tr: row.locationTr },
    },
    email: row.email,
    phone: row.phone,
  };
}

export async function getOpeningHours(): Promise<OpeningHourRecord[]> {
  const rows = await db.openingHour.findMany({ orderBy: { order: "asc" } });
  return rows.map((row) => ({
    day: row.day,
    order: row.order,
    label: { fr: row.labelFr, en: row.labelEn, tr: row.labelTr },
    opensAt: row.opensAt,
    closesAt: row.closesAt,
  }));
}

export async function updateStoreConfig(input: {
  config: StoreConfigRecord;
  openingHours: OpeningHourRecord[];
}) {
  await db.$transaction(async (tx) => {
    await tx.storeConfig.upsert({
      where: { id: "main" },
      update: {
        nameFr: input.config.name.fr,
        nameEn: input.config.name.en,
        nameTr: input.config.name.tr,
        categoryFr: input.config.category.fr,
        categoryEn: input.config.category.en,
        categoryTr: input.config.category.tr,
        descriptionFr: input.config.description.fr,
        descriptionEn: input.config.description.en,
        descriptionTr: input.config.description.tr,
        locationCity: input.config.location.city,
        locationCountry: input.config.location.country,
        locationFr: input.config.location.display.fr,
        locationEn: input.config.location.display.en,
        locationTr: input.config.location.display.tr,
        email: input.config.email,
        phone: input.config.phone,
      },
      create: {
        id: "main",
        nameFr: input.config.name.fr,
        nameEn: input.config.name.en,
        nameTr: input.config.name.tr,
        categoryFr: input.config.category.fr,
        categoryEn: input.config.category.en,
        categoryTr: input.config.category.tr,
        descriptionFr: input.config.description.fr,
        descriptionEn: input.config.description.en,
        descriptionTr: input.config.description.tr,
        locationCity: input.config.location.city,
        locationCountry: input.config.location.country,
        locationFr: input.config.location.display.fr,
        locationEn: input.config.location.display.en,
        locationTr: input.config.location.display.tr,
        email: input.config.email,
        phone: input.config.phone,
      },
    });

    await tx.openingHour.deleteMany({});
    if (input.openingHours.length > 0) {
      await tx.openingHour.createMany({
        data: input.openingHours.map((hour) => ({
          day: hour.day,
          order: hour.order,
          labelFr: hour.label.fr,
          labelEn: hour.label.en,
          labelTr: hour.label.tr,
          opensAt: hour.opensAt,
          closesAt: hour.closesAt,
          storeConfigId: "main",
        })),
      });
    }
  });
}
