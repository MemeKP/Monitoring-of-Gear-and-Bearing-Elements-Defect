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

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
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

export function useDashboardAttention({ site = 'all', filter = 'all' } = {}) {
  return useInfiniteQuery({
    queryKey: ['dashboard', 'attention', { site, filter }],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await dashboardApi.getAttention({ site, filter, page: pageParam });
      return response; 
    },
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.meta;
      if (meta && meta.page < meta.totalPages) {
        return meta.page + 1;
      }
      return undefined;
    },
  });
}

export function useDashboardOverdue(site = 'all', filter='all') {
  return useInfiniteQuery({
    queryKey: ['dashboard', 'overdue', {site, filter}],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await dashboardApi.getOverdue({ site, page: pageParam, filter });
      console.log('RAW OVERDUE RESPONSE', response)
      return response;
    },
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.meta;
      if (meta && meta.page < meta.totalPages) {
        return meta.page + 1;
      }
      return undefined;
    },
  });
}