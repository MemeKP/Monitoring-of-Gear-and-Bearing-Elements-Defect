import { useInfiniteQuery } from '@tanstack/react-query';
import { equipmentApi } from '../api/dashboard';
import { SatelliteDish } from 'lucide-react';

export function useEquipmentList(filters = {}) {
  return useInfiniteQuery({
    queryKey: ['equipment', 'infinite', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await equipmentApi.getList({ ...filters, page: pageParam });
      // console.log('EQUIPLT', res)
      return res; 
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.meta;
      if (!meta) return undefined;
      return meta.page < meta.totalPages ? meta.page + 1 : undefined;
    },
    placeholderData: (prev) => prev,
  });
}

export function useEquipmentIndex(site, search) {
  return useInfiniteQuery({
    queryKey: ['equipment', 'tree', site, search],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await equipmentApi.getTree({ 
        site: site === 'all' ? undefined : site, 
        search: search || undefined,
        page: pageParam,
        limit: 20 
      });
      return res; 
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.meta;
      if (!meta) return undefined;
      return meta.page < meta.totalPages ? meta.page + 1 : undefined;
    },
    enabled: !!site, 
  });
}