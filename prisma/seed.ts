import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient, ProductStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { isSaStorageConfigured, uploadStorageFile } from "../src/lib/sastorage";

type LocaleField = { fr: string; en: string; tr: string };
type ProductSeed = {
  id: string;
  name: LocaleField;
  category: LocaleField;
  price: number | null;
  currency: string;
  images: string[];
};

type StoreSeed = {
  name: LocaleField;
  category: LocaleField;
  description: LocaleField;
  location: {
    city: string;
    country: string;
    display: LocaleField;
  };
  email: string;
  phone: string;
  openingHours: Array<{
    day: string;
    label: LocaleField;
    opensAt: number;
    closesAt: number;
  }>;
};

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for seeding.");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function readSeedJson<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

function getContentTypeFromExt(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

async function uploadImageIfAvailable(localRelativePath: string) {
  const normalized = localRelativePath.replace(/^\//, "");
  const absolute = path.join(process.cwd(), "public", normalized);

  try {
    const bytes = await readFile(absolute);
    const remotePath = normalized;
    if (!isSaStorageConfigured()) return localRelativePath;

    return await uploadStorageFile({
      key: remotePath,
      body: bytes,
      contentType: getContentTypeFromExt(remotePath),
      fileName: path.basename(remotePath),
    });
  } catch {
    return localRelativePath;
  }
}

async function main() {
  const productsPath = path.join(process.cwd(), "data", "products.json");
  const storePath = path.join(process.cwd(), "src", "constant.ts");

  const products = await readSeedJson<ProductSeed[]>(productsPath);

  // Extract STORE object by evaluating a JSON-like transform from the TS source.
  const storeSource = await readFile(storePath, "utf8");
  const storeJson = storeSource
    .replace(/^export const STORE = /, "")
    .replace(/ as const;?\s*$/, "")
    .replace(/(\s*\/\/.*)$/gm, "")
    .replace(/(\d+)\s*\*\s*60\s*\*\s*60\s*\*\s*1000/g, (_m, hours) =>
      String(Number(hours) * 60 * 60 * 1000)
    );

  const store = Function(`"use strict"; return (${storeJson});`)() as StoreSeed;

  const seededProducts = await Promise.all(
    products.map(async (product) => {
      const images = await Promise.all(product.images.map(uploadImageIfAvailable));

      return prisma.product.upsert({
        where: { id: product.id },
        update: {
          nameFr: product.name.fr,
          nameEn: product.name.en,
          nameTr: product.name.tr,
          categoryFr: product.category.fr,
          categoryEn: product.category.en,
          categoryTr: product.category.tr,
          price: product.price,
          currency: product.currency,
          images,
          status: ProductStatus.published,
          tags: Array.from(
            new Set([
              product.category.fr.toLowerCase(),
              product.category.en.toLowerCase(),
              product.category.tr.toLowerCase(),
            ])
          ),
          stock: 10,
        },
        create: {
          id: product.id,
          nameFr: product.name.fr,
          nameEn: product.name.en,
          nameTr: product.name.tr,
          categoryFr: product.category.fr,
          categoryEn: product.category.en,
          categoryTr: product.category.tr,
          price: product.price,
          currency: product.currency,
          images,
          status: ProductStatus.published,
          tags: Array.from(
            new Set([
              product.category.fr.toLowerCase(),
              product.category.en.toLowerCase(),
              product.category.tr.toLowerCase(),
            ])
          ),
          stock: 10,
        },
      });
    })
  );

  await prisma.storeConfig.upsert({
    where: { id: "main" },
    update: {
      nameFr: store.name.fr,
      nameEn: store.name.en,
      nameTr: store.name.tr,
      categoryFr: store.category.fr,
      categoryEn: store.category.en,
      categoryTr: store.category.tr,
      descriptionFr: store.description.fr,
      descriptionEn: store.description.en,
      descriptionTr: store.description.tr,
      locationCity: store.location.city,
      locationCountry: store.location.country,
      locationFr: store.location.display.fr,
      locationEn: store.location.display.en,
      locationTr: store.location.display.tr,
      email: store.email,
      phone: store.phone,
    },
    create: {
      id: "main",
      nameFr: store.name.fr,
      nameEn: store.name.en,
      nameTr: store.name.tr,
      categoryFr: store.category.fr,
      categoryEn: store.category.en,
      categoryTr: store.category.tr,
      descriptionFr: store.description.fr,
      descriptionEn: store.description.en,
      descriptionTr: store.description.tr,
      locationCity: store.location.city,
      locationCountry: store.location.country,
      locationFr: store.location.display.fr,
      locationEn: store.location.display.en,
      locationTr: store.location.display.tr,
      email: store.email,
      phone: store.phone,
    },
  });

  await prisma.openingHour.deleteMany({});
  await prisma.openingHour.createMany({
    data: store.openingHours.map((hour, index) => ({
      day: hour.day,
      order: index,
      labelFr: hour.label.fr,
      labelEn: hour.label.en,
      labelTr: hour.label.tr,
      opensAt: hour.opensAt,
      closesAt: hour.closesAt,
      storeConfigId: "main",
    })),
  });

  console.log(
    `Seeded ${seededProducts.length} products and ${store.openingHours.length} opening-hour rows.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
