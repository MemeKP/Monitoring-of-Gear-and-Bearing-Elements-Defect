/**
 * Main Responsibility:
 *  This file contains all React Query hooks related to dashboard data fetching.
 * 
 * Query Groups:
 * 
 * 1. useDashboardStats
 *    Fetch dashboard summary/statistics data
 * Cache Key: ['dashboard', 'stats', site]
 * Params:
 * @param {string} site
 * Current selected site filter.
 * Default = 'all'
 *
 * 2. useDashboardAttention
 *    Fetch attention/critical issue list
 *  Params:
 * @param {string} site
 * Current selected site
 * @param {string} filter
 * Current selected filter
 * Example:
 * - all
 * - F
 * - E
 * @param {number} page
 * Current pagination page
 *
 * 3. useDashboardOverdue
 *    Fetch overdue items
 * Cache Key:  ['dashboard', 'overdue', site]
 * Params:
 * @param {string} site
 * Current selected site filter
 * 
 */

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard';

export function useDashboardStats(site = 'all') {
  return useQuery({
    queryKey: ['dashboard', 'stats', site],
    queryFn:  async () => {
      const res = await dashboardApi.getStats(site)
      return res
    },
  });
}

export function useDashboardAttention({ site = 'all', filter = 'all', page = 1 } = {}) {
  return useQuery({
    queryKey: ['dashboard', 'attention', { site, filter, page }],
    queryFn:  async () => {
       const res = await dashboardApi.getAttention({ site, filter, page });
        // console.log(" API:", res);
        return {
        items: res,                 // data list
        total: res?.length ?? 0,    // fallback
      };
    },
    placeholderData: (prev) => prev,
  });
}

export function useDashboardOverdue(site = 'all') {
  return useQuery({
    queryKey: ['dashboard', 'overdue', site],
    queryFn:  () => dashboardApi.getOverdue({ site }),
  });
}