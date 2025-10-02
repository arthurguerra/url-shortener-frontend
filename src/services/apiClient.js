import api from '../api'

const apiClient = {
    getUrls: async (page, size, sortBy, sortDirection) => {
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
    },

    deleteUrl: async (shortCode) => {
        await api.delete(`/link/${shortCode}`)
    }
}

export default apiClient