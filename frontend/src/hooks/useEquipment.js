import { useInfiniteQuery } from '@tanstack/react-query';
import { equipmentApi } from '../api/dashboard';

export function useEquipmentList(filters = {}) {
  return useInfiniteQuery({
    queryKey: ['equipment', 'infinite', filters],
    queryFn: async ({ pageParam = 1 }) => {
      if (filters.search && filters.search.trim() !== '') {
       // console.log('SEND API: /search with:', filters.search);
        
        try {
          const res = await equipmentApi.search({ 
            q: filters.search, 
            site: filters.site 
          });
          
          // console.log('[RESULT Typesense]:', res);

          return {
            success: true,
            data: res.data || res || [], 
            meta: { page: 1, totalPages: 1, total: res?.data?.length || res?.length || 0 }
          };
        } catch (err) {
          console.error('[Typesense Error]:', err);
          throw err;
        }
      }
      const res = await equipmentApi.getList({ ...filters, page: pageParam });
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
