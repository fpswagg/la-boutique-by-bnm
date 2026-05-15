"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { dashboardFr } from "@/lib/dashboard/fr";

export interface OverviewBarItem {
  label: string;
  views: number;
}

export function OverviewChart({ data }: { data: OverviewBarItem[] }) {
  return (
      <div className="min-w-0 w-full border border-[var(--border)] p-4">
      <p className="text-xs tracking-[0.3em] uppercase text-[var(--muted)] mb-4">
        {dashboardFr.overview.chartTitle}
      </p>
      <div className="h-[240px] min-h-[200px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
            <CartesianGrid
              stroke="var(--chart-grid)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              stroke="var(--border)"
              tickLine={{ stroke: "var(--border)" }}
              axisLine={{ stroke: "var(--border)" }}
              interval={0}
              angle={-28}
              textAnchor="end"
              height={56}
            />
            <YAxis
              tick={{ fill: "var(--muted)", fontSize: 12 }}
              stroke="var(--border)"
              tickLine={{ stroke: "var(--border)" }}
              axisLine={{ stroke: "var(--border)" }}
              width={36}
            />
            <Tooltip
              cursor={{ fill: "var(--surface-2)", opacity: 0.35 }}
              contentStyle={{
                backgroundColor: "var(--chart-tooltip-bg)",
                border: "1px solid var(--chart-tooltip-border)",
                borderRadius: "6px",
                color: "var(--fg)",
                fontSize: "12px",
              }}
              labelStyle={{ color: "var(--muted)", marginBottom: "4px" }}
              itemStyle={{ color: "var(--fg)" }}
              formatter={(value) => [
                Number(value ?? 0).toLocaleString("fr-FR"),
                dashboardFr.overview.chartViews,
              ]}
            />
            <Bar
              dataKey="views"
              fill="var(--chart-bar)"
              radius={[4, 4, 0, 0]}
              activeBar={{ fill: "var(--chart-bar-hover)", opacity: 1 }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
