import api from '../api'

const apiClient = {
    getUrls: async (page = 0, size = 10, sortBy = 'createdAt', sortDirection = 'DESC') => {
        const response = await api.get(`/links?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`)
        return response.data
    }
}

export default apiClient