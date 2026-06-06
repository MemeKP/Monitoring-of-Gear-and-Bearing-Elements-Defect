import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reportApi } from '../api/dashboard'

export const reportKeys = {
  all: ['reports'],
  one: (id) => ['reports', id],
  byFftId: (fftId) => ['reports', 'fft', fftId],
}

export const useReportByFftId = (fftId) => {
  const query = useQuery({
    queryKey: reportKeys.byFftId(fftId),
    queryFn: () => reportApi.getByFftId(fftId),
    enabled: !!fftId,
  })
  return {
    hasReport: !!query.data,      
    report: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}

export const useReports = () => {
  return useQuery({
    queryKey: reportKeys.all,
    queryFn: () => reportApi.getAll(),
  })
}

export const useReport = (id) => {
  return useQuery({
    queryKey: reportKeys.one(id),
    queryFn: () => reportApi.getOne(id),
    enabled: !!id,
  })
}

export const useCreateReport = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => reportApi.create(data),
    onSuccess: (newReport) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.all })
      queryClient.invalidateQueries({ queryKey: reportKeys.byFftId(newReport.envelopedFftId) })
    },
  })
}

export const useUpdateReport = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => reportApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.all })
      queryClient.invalidateQueries({ queryKey: reportKeys.one(id) })
    },
  })
}

export const useRemoveReport = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => reportApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.all })
    },
  })
}