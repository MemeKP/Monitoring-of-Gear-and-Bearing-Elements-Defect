import xior from 'xior'

const BASE = import.meta.env.VITE_API_URL

const apiClient = xior.create({
    baseURL: BASE,
})

apiClient.interceptors.response.use(
    (res) => {
        if (res.config.reqFullData) {
            return res.data; // { success, data, meta } 
        }

        return res.data.data;
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
            reqFullData: true,
        }),

    getOverdue: ({ site = 'all', thresholdDays = 90, page = 1, limit = 8, filter = 'all' } = {}) =>
        apiClient.get('/dashboard/overdue', {
            params: {
                site,
                threshold_days: thresholdDays,
                page,
                limit,
                filter,
            },
            reqFullData: true,
        }),
}

export const measurementApi = {
    getOne: (id) =>
        apiClient.get(`/measurements/${id}`)
};

export const equipmentApi = {
    getList: ({ site, grade, f_filter, search, sort, order, page, limit } = {}) => {
        const params = new URLSearchParams();
        if (site) {
            params.set('site', site);
        }
        if (grade) {
            params.set('grade', grade);
        }
        if (f_filter) {
            params.set('f_filter', f_filter)
        }
        if (search) {
            params.set('search', search);
        }
        if (sort) {
            params.set('sort', sort);
        }
        if (order) {
            params.set('order', order);
        }
        if (page) {
            params.set('page', page);
        }
        if (limit) {
            params.set('limit', limit);
        }
        return apiClient.get(`/equipments?${params.toString()}`, {
            reqFullData: true
        });
    },
    getTree: (params) => apiClient.get('/equipments/machine-index', {
        params,
        reqFullData: true
    }),

    // search: ({ q, site = 'all' }) => {
    //   return apiClient.get('/equipments/search', {
    //     params: { q, site },
    //     reqFullData: true 
    //   });
    // },

}