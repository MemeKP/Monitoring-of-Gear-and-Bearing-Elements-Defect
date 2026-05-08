import { useInfiniteQuery } from '@tanstack/react-query';
import { equipmentApi } from '../api/dashboard';

export function useEquipmentList(filters = {}) {
    return useInfiniteQuery({
    queryKey: ['equipment', 'infinite', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await equipmentApi.getList({ ...filters, page: pageParam });
      return res; 
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    placeholderData: (prev) => prev,
  });
}