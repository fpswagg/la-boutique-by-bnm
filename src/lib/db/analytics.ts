import { AnalyticsEvent } from "@prisma/client";
import { db } from "@/lib/db";

export async function recordEvent(input: {
  event: AnalyticsEvent;
  productId?: string;
  locale?: string;
}) {
  await db.analytics.create({
    data: {
      event: input.event,
      productId: input.productId,
      locale: input.locale,
    },
  });
}

export async function clearAllAnalytics() {
  await db.$transaction([
    db.analytics.deleteMany({}),
    db.product.updateMany({ data: { views: 0 } }),
  ]);
}

export type AnalyticsWindow = "today" | "week" | "month";

function windowStart(window: AnalyticsWindow): Date {
  const now = new Date();
  if (window === "today") {
    return new Date(now.setHours(0, 0, 0, 0));
  }
  if (window === "week") {
    return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  }
  return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
}

export async function getAnalyticsSummary(window: AnalyticsWindow = "today") {
  const since = windowStart(window);

  const [totalProducts, publishedProducts, lowStockProducts, totalOrders, eventsInWindow] =
    await Promise.all([
      db.product.count(),
      db.product.count({ where: { status: "published" } }),
      db.product.count({ where: { stock: { lte: 5 } } }),
      db.order.count(),
      db.analytics.count({
        where: { createdAt: { gte: since } },
      }),
    ]);

  const topViewed = await db.product.findMany({
    orderBy: { views: "desc" },
    take: 5,
    select: {
      id: true,
      nameFr: true,
      views: true,
      stock: true,
    },
  });

  const recentEvents = await db.analytics.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    take: 12,
    select: {
      id: true,
      event: true,
      locale: true,
      productId: true,
      createdAt: true,
      product: { select: { nameFr: true } },
    },
  });

  const groupedRaw = await db.analytics.groupBy({
    by: ["event"],
    where: { createdAt: { gte: since } },
    _count: { event: true },
  });

  return {
    window,
    cards: {
      totalProducts,
      publishedProducts,
      lowStockProducts,
      totalOrders,
      eventsInWindow,
    },
    groupedEvents: groupedRaw
      .map((row) => ({
        event: row.event,
        count: row._count.event,
      }))
      .sort((a, b) => b.count - a.count),
    topViewed: topViewed.map((item) => ({
      productId: item.id,
      label: item.nameFr,
      views: item.views,
      stock: item.stock,
    })),
    recentEvents: recentEvents.map((event) => ({
      id: event.id.toString(),
      event: event.event,
      locale: event.locale,
      productId: event.productId,
      productNameFr: event.product?.nameFr ?? null,
      createdAt: event.createdAt.toISOString(),
    })),
  };
}
