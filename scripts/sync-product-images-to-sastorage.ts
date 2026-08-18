import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { isSaStorageConfigured, uploadStorageFile } from "../src/lib/sastorage";

const LOCAL_DIR = path.join(process.cwd(), "data", "products");

function contentType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

function productIdFromFileName(fileName: string): string {
  return fileName.replace(/_\d+\.[^.]+$/i, "").replace(/\.[^.]+$/i, "");
}

async function main() {
  if (!isSaStorageConfigured()) {
    throw new Error("SA_STORAGE_TOKEN is missing.");
  }
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is missing.");
  }

  const adapter = new PrismaPg({ connectionString: databaseUrl, max: 1 });
  const prisma = new PrismaClient({ adapter });

  const files = (await readdir(LOCAL_DIR))
    .filter((name) => /\.(png|jpe?g|webp)$/i.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  if (files.length === 0) {
    throw new Error(`No images found in ${LOCAL_DIR}`);
  }

  const urlsByProduct = new Map<string, string[]>();
  let uploaded = 0;

  for (const fileName of files) {
    const absolute = path.join(LOCAL_DIR, fileName);
    const key = `products/${fileName}`;
    const body = await readFile(absolute);
    const publicUrl = await uploadStorageFile({
      key,
      body,
      contentType: contentType(fileName),
      fileName,
    });
    const productId = productIdFromFileName(fileName);
    const list = urlsByProduct.get(productId) ?? [];
    list.push(publicUrl);
    urlsByProduct.set(productId, list);
    uploaded += 1;
    console.log(`uploaded ${fileName} -> ${publicUrl}`);
  }

  const products = await prisma.product.findMany({ select: { id: true, images: true } });
  let updated = 0;

  for (const product of products) {
    const nextImages = urlsByProduct.get(product.id);
    if (!nextImages?.length) {
      console.warn(`no local files for product ${product.id}, leaving images unchanged`);
      continue;
    }
    await prisma.product.update({
      where: { id: product.id },
      data: { images: nextImages },
    });
    updated += 1;
    console.log(`updated product ${product.id} (${nextImages.length} images)`);
  }

  await prisma.$disconnect();
  console.log(`Done. Uploaded ${uploaded} files, updated ${updated} products.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
