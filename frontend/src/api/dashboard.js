import xior from 'xior'

const BASE = import.meta.env.VITE_API_URL

const apiClient = xior.create({
    baseURL: BASE,
})

apiClient.interceptors.response.use(
    (res) => {
        return res.data.data
    },
    (error) => {
        console.error('API Error:', error.message)
        return Promise.reject(error);
    }


)
export const dashboardApi = {
    getStats: (site = 'all') => 
        apiClient.get('dashboard/stats', {
            params: { site }
        }),

    getAttention: ({ site = 'all', filter = 'all', page = 1, limit = 20 } = {}) => 
        apiClient.get('/dashboard/attention', {
            params: { site, filter, page, limit },
        }),

    getOverdue: ({ site = 'all', thresholdDays = 90, limit = 8 } = {}) =>
    apiClient.get('/dashboard/overdue', {
      params: { 
        site, 
        threshold_days: thresholdDays, 
        limit 
      },
    }),
}