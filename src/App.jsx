import { useEffect, useState } from 'react'
import api from './api'

function App() {
  const [urls, setUrls] = useState([])
  const [newUrl, setNewUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0
  });
  const [sorting, setSorting] = useState({
    sortBy: 'createdAt',
    sortDirection: 'DESC'
  });
  const [selectedLogs, setSelectedLogs] = useState(null);

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = (page = 0, size = 10, sortBy = sorting.sortBy, sortDirection = sorting.sortDirection) => {
    api.get(`/links?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`)
    .then((response) => {
      setUrls(response.data.content);
      setPagination({
        page: response.data.number,
        size: response.data.size,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements
      });
    })
    .catch((error) => {
      console.log('API error:', error);
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    const endpoint = customCode.trim() ? '/shorten/custom' : '/shorten';
    const payload = customCode.trim() 
      ? { url: newUrl, shortCode: customCode.trim() }
      : { url: newUrl };
    
    api.post(endpoint, payload)
    .then((response) => {
      fetchUrls();
      setNewUrl('');
      setCustomCode('');
    })
    .catch((error) => {
      setErrorMessage(error.response?.data?.message || 'An error occurred');
    })
  }

  const handlePageSizeChange = (newSize) => {
    fetchUrls(0, newSize);
  }

  const handleSort = (field) => {
    const newDirection = sorting.sortBy === field && sorting.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    setSorting({ sortBy: field, sortDirection: newDirection });
    fetchUrls(0, pagination.size, field, newDirection);
  }

  const fetchLogs = (shortCode) => {
    api.get(`/log/${shortCode}`)
    .then((response) => {
      setSelectedLogs(response.data);
      setTimeout(() => {
        document.getElementById('logs-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    })
    .catch((error) => {
      console.log('Logs error:', error);
    })
  }

  const deleteUrl = (shortCode) => {
    api.delete(`/link/${shortCode}`)
    .then(() => {
      fetchUrls();
    })
    .catch((error) => {
      console.log('Delete error:', error);
    })
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">URL Shortener</h1>
          <p className="text-gray-400">Create and manage your shortened URLs</p>
        </div>

        {/* Form Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create Short URL</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Original URL *
              </label>
              <input
                type='text' 
                value={newUrl} 
                onChange={(e) => setNewUrl(e.target.value)} 
                placeholder='https://example.com'
                required
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Custom Short Code (Optional)
              </label>
              <input
                type='text' 
                value={customCode} 
                onChange={(e) => setCustomCode(e.target.value)} 
                placeholder='my-custom-code'
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200"
            >
              Create Short URL
            </button>
          </form>

          {errorMessage && (
            <div className="mt-4 p-4 bg-red-900 border border-red-700 rounded-md text-red-200">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Main Table Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Your URLs</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th 
                    onClick={() => handleSort('createdAt')} 
                    className="text-left py-3 px-4 font-medium text-gray-300 cursor-pointer hover:text-white select-none"
                  >
                    Created At {sorting.sortBy === 'createdAt' && (sorting.sortDirection === 'ASC' ? '↑' : '↓')}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Original URL</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Short URL</th>
                  <th 
                    onClick={() => handleSort('clicks')} 
                    className="text-left py-3 px-4 font-medium text-gray-300 cursor-pointer hover:text-white select-none"
                  >
                    Clicks {sorting.sortBy === 'clicks' && (sorting.sortDirection === 'ASC' ? '↑' : '↓')}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {urls && urls.map((url) => (
                  <tr key={url.shortUrl} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="py-3 px-4 text-gray-300">
                      {url.createdAt}
                    </td>
                    <td className="py-3 px-4">
                      <a 
                        href={url.originalUrl} 
                        target='_blank'
                        className="text-blue-400 hover:text-blue-300 underline truncate block max-w-xs"
                      >
                        {url.originalUrl}
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      <a 
                        href={`http://localhost:8080/${url.shortUrl}`} 
                        target='_blank'
                        className="text-green-400 hover:text-green-300 underline"
                      >
                        {url.shortUrl}
                      </a>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{url.clicks}</td>
                    <td className="py-3 px-4 space-x-2">
                      <button 
                        onClick={() => fetchLogs(url.shortUrl)}
                        disabled={url.clicks === 0}
                        className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                      >
                        View Logs
                      </button>
                      <button
                        onClick={() => deleteUrl(url.shortUrl)}
                        className="bg-red-700 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-700">
            <div className="text-sm text-gray-400">
              Showing {pagination.page * pagination.size + 1}-{pagination.page * pagination.size + urls.length} of {pagination.totalElements} results
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => fetchUrls(pagination.page - 1, pagination.size)}
                disabled={pagination.page === 0}
                className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
              >
                Previous
              </button>
              <span className="text-sm text-gray-300">
                Page {pagination.page + 1} of {pagination.totalPages}
              </span>
              <button 
                onClick={() => fetchUrls(pagination.page + 1, pagination.size)}
                disabled={pagination.page >= pagination.totalPages - 1}
                className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
              >
                Next
              </button>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-400">Show:</span>
              <select 
                value={pagination.size} 
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-gray-400">per page</span>
            </div>
          </div>
        </div>

        {/* Logs Card */}
        {selectedLogs && (
          <div id="logs-section" className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Access Logs for {selectedLogs.shortUrl}</h2>
              <button 
                onClick={() => setSelectedLogs(null)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
              >
                Close
              </button>
            </div>
            
            <div className="mb-4 p-4 bg-gray-700 rounded-md">
              <p className="text-gray-300">
                <span className="font-medium">Original URL:</span>{' '}
                <a href={selectedLogs.originalUrl} target='_blank' className="text-blue-400 hover:text-blue-300 underline">
                  {selectedLogs.originalUrl}
                </a>
              </p>
              <p className="text-gray-300 mt-1">
                <span className="font-medium">Total Clicks:</span> {selectedLogs.clicks}
              </p>
            </div>
            
            {selectedLogs.logs.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No logs found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-300">IP Address</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300">User Agent</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300">Accessed At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedLogs.logs.map((log, index) => (
                      <tr key={index} className="border-b border-gray-700">
                        <td className="py-3 px-4 text-gray-300 font-mono text-sm">{log.ip}</td>
                        <td className="py-3 px-4 text-gray-300 text-sm truncate max-w-xs">{log.userAgent}</td>
                        <td className="py-3 px-4 text-gray-300 text-sm">{log.accessedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App