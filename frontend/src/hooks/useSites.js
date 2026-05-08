import { useMemo } from "react";
import { SITE_CONFIG } from "../constant/siteConfig";
import { useDashboardStats } from "./useDashboardStats";
import { MOCK_SITE_DATA } from "../mock/SITES";

/**
 * Returns the merged SITES array that ThaiMap and SiteCard expect.
 * Shape per item:
 * {
 *   id, displayName, provinces, dot,
 *   grades: [{ label, color, count, pct }],
 *   total_machines,
 *   loading, error
 * }
 */
export function useSites() {
  const { data: statsData, isLoading: loading, error } = useDashboardStats();

  const IS_MOCK = false;
  const sites = useMemo(() => {
    const activeData = IS_MOCK ? MOCK_SITE_DATA : statsData;
    return SITE_CONFIG.map(config => {
      const bySite = activeData?.data?.by_site ?? activeData?.by_site ?? [];
      // const bySite = statsData?.data?.by_site ?? statsData?.by_site ?? [];
      const siteStats = bySite.find(
        s => String(s.site).toLowerCase() === String(config.id).toLowerCase()
      );
      const GRADE_COLORS = {
        F: "#FF3B3B",
        E: "#FFFF00",
        D: "#FF9800",
        C: "#C1D343",
        B: "#4CAF50",
        A: "#2196F3",
      };

      const grades = siteStats
        ? siteStats.stage_breakdown.map(g => ({
          label: `${g.grade} Grade`,
          color: GRADE_COLORS[g.grade] ?? "#A2ADB6",
          count: g.count,
          pct: g.percentage,
        }))
        : [];

      // dot
      const worstGrade = grades.find(g => g.count > 0)?.label?.[0] ?? "A";
      const dotColor = GRADE_COLORS[worstGrade] ?? "#546A81";
      console.log("Stats Data:", statsData);

      return {
        ...config,
        grades,
        total_machines: siteStats?.total_machines ?? 0,
        dot: { ...config.dot, color: dotColor },
      };
    });
  }, [statsData, IS_MOCK]);

  return { sites, loading, error };
}