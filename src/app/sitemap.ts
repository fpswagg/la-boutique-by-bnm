import { MetadataRoute } from "next";
import { locales } from "../../middleware";
import { products } from "@/lib/products";

const BASE_URL = "https://laboutique-bnm.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    routes.push(
      { url: `${BASE_URL}/${locale}`, lastModified: new Date() },
      { url: `${BASE_URL}/${locale}/products`, lastModified: new Date() },
      { url: `${BASE_URL}/${locale}/cart`, lastModified: new Date() },
      { url: `${BASE_URL}/${locale}/contact`, lastModified: new Date() }
    );

    for (const product of products) {
      routes.push({
        url: `${BASE_URL}/${locale}/products/${product.id}`,
        lastModified: new Date(),
      });
    }
  }

  return routes;
}
