import api from '../api'

const apiClient = {
    getUrls: async (page = 0, size = 10, sortBy = 'createdAt', sortDirection = 'DESC') => {
        const response = await api.get(`/links?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`)
        return response.data
    },

    createUrl: async (url, customCode = null) => {
        const endpoint = customCode ? '/shorten/custom' : '/shorten'
        const payload = customCode ? { url, shortCode: customCode } : { url }
        const response = await api.post(endpoint, payload)
        return response.data
    },

    getLogs: async (shortCode) => {
        const response = await api.get(`/log/${shortCode}`)
        return response.data
    }
}

export default apiClient