/**
 * Main Responsibility:
 * This hook combines:
 * - Static site configuration
 * - Dynamic dashboard statistics
 *
 * Why this hook exists:
 *  Raw API data and UI config data come from different sources.
 *
 * This hook acts as a "data composition layer"
 * that merges:
 * 1. Static frontend configuration
 *    - map position
 *    - site metadata
 *    - default UI settings
 * 2. Dynamic backend statistics
 *    - grade counts
 *    - percentages
 *    - machine totals
 *
 * Result:
 * Components receive fully prepared site objects
 * without needing additional transformation logic.
 *
 * Data Sources:
 * - SITE_CONFIG
 *   Static frontend configuration
 * - useDashboardStats()
 *   Live API dashboard statistics
 * - MOCK_SITE_DATA
 *   Optional local mock data for development/testing
 * 
 */

import { useMemo } from "react";
import { SITE_CONFIG } from "../constant/siteConfig";
import { useDashboardStats } from "./useDashboardStats";
import { MOCK_SITE_DATA } from "../mock/SITES";

export function useSites() {
  const { data: statsData, isLoading: loading, error } = useDashboardStats();

  // const IS_MOCK = true;
  const sites = useMemo(() => {
    // const activeData = IS_MOCK ? MOCK_SITE_DATA : statsData;
    const activeData = statsData;

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
      // console.log("Stats Data:", statsData);

      return {
        ...config,
        grades,
        total_machines: siteStats?.total_machines ?? 0,
        dot: { ...config.dot, color: dotColor },
      };
    });
  }, [statsData]); // if use mock -> add IS_MOCK here

  return { sites, loading, error };
}