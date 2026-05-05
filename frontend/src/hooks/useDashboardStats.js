import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard';

export function useDashboardStats(site = 'all') {
  return useQuery({
    queryKey: ['dashboard', 'stats', site],
    queryFn:  () => dashboardApi.getStats(site),
  });
}

export function useDashboardAttention({ site = 'all', filter = 'all', page = 1 } = {}) {
  return useQuery({
    queryKey: ['dashboard', 'attention', { site, filter, page }],
    queryFn:  async () => {
       const res = await dashboardApi.getAttention({ site, filter, page });
       console.log(" API:", res);
       return res; 
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