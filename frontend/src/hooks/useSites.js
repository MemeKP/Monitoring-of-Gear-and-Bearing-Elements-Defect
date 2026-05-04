import { useMemo } from "react";
import { SITE_CONFIG } from "../constant/siteConfig";
import { useDashboardStats } from "./useDashboardStats";

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
  const { data: statsData, loading, error } = useDashboardStats();

  const sites = useMemo(() => {
    return SITE_CONFIG.map(config => {
      // Find this site's stats from the API response
      // API returns breakdown per site inside stage_breakdown
      const siteStats = statsData?.by_site?.find(s => s.site === config.id);

      const GRADE_COLORS = {
        F: "#FF3B3B",
        E: "#FFCB05",
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
            pct:   g.percentage,
          }))
        : [];

      // Dot color = driven by worst grade present
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
  }, [statsData]);

  return { sites, loading, error };
}