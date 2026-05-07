import { useQuery } from '@tanstack/react-query';
import { equipmentApi } from '../api/dashboard';

export function useEquipmentList(filters = {}) {
    return useQuery({
        queryKey: ['equipment', 'list', filters],
        queryFn: () => equipmentApi.getList(filters),
        placeholderData: (prev)=>prev,
    })
}