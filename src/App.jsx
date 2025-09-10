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
    <div>
      <h1>URL Shortener</h1>

      <form onSubmit={handleSubmit}>
        <input
         type='text' 
         value={newUrl} 
         onChange={(e) => setNewUrl(e.target.value)} 
         placeholder='Enter a URL'
         required/>
        <input
         type='text' 
         value={customCode} 
         onChange={(e) => setCustomCode(e.target.value)} 
         placeholder='Custom short code (optional)'/>
         <button type="submit">Shorten</button>
      </form>

      {errorMessage && (
        <div style={{color: 'red', margin: '10px 0'}}>
          {errorMessage}
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th 
              onClick={() => handleSort('createdAt')} 
              style={{cursor: 'pointer', userSelect: 'none'}}
            >
              Created At {sorting.sortBy === 'createdAt' && (sorting.sortDirection === 'ASC' ? '↑' : '↓')}
            </th>
            <th>Original URL</th>
            <th>Shortened URL</th>
            <th 
              onClick={() => handleSort('clicks')} 
              style={{cursor: 'pointer', userSelect: 'none'}}
            >
              Clicks {sorting.sortBy === 'clicks' && (sorting.sortDirection === 'ASC' ? '↑' : '↓')}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {urls && urls.map((url) => (
            <tr key={url.shortUrl}>
              <td>{url.createdAt}</td>
              <td>
                <a href={url.originalUrl} target='_blank'>
                  {url.originalUrl}
                </a>
              </td>
              <td>
                <a href={`http://localhost:8080/${url.shortUrl}`} target='_blank'>
                  {url.shortUrl}
                </a>
              </td>
              <td>{url.clicks}</td>
              <td>
                <button 
                  onClick={() => fetchLogs(url.shortUrl)}
                  disabled={url.clicks === 0}
                >
                  View Logs
                </button>
                <button
                onClick={() => deleteUrl(url.shortUrl)}
                >
                 Delete 
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{margin: '10px 0', textAlign: 'center', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          Showing {pagination.page * pagination.size + 1}-{pagination.page * pagination.size + urls.length} of {pagination.totalElements} results
        </div>
        
        <div>
          <button 
            onClick={() => fetchUrls(pagination.page - 1, pagination.size)}
            disabled={pagination.page === 0}
          >
            Previous
          </button>
          <span style={{margin: '0 15px'}}>
            Page {pagination.page + 1} of {pagination.totalPages}
          </span>
          <button 
            onClick={() => fetchUrls(pagination.page + 1, pagination.size)}
            disabled={pagination.page >= pagination.totalPages - 1}
          >
            Next
          </button>
        </div>
        
        <div>
          Show: 
          <select 
            value={pagination.size} 
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            style={{margin: '0 5px'}}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          results
        </div>
      </div>


      {selectedLogs && (
        <div style={{margin: '20px 0'}}>
          <h3>Access Logs for {selectedLogs.shortUrl}</h3>
          <p>Original URL: <a href={selectedLogs.originalUrl} target='_blank'>{selectedLogs.originalUrl}</a></p>
          <p>Total Clicks: {selectedLogs.clicks}</p>
          
          {selectedLogs.logs.length === 0 ? (
            <p>No logs found</p>
          ): (
          <table>
            <thead>
              <tr>
                <th>IP Address</th>
                <th>User Agent</th>
                <th>Accessed At</th>
              </tr>
            </thead>
            <tbody>
              {selectedLogs.logs.map((log, index) => (
                <tr key={index}>
                  <td>{log.ip}</td>
                  <td>{log.userAgent}</td>
                  <td>{new Date(log.accessedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
          
          <button onClick={() => setSelectedLogs(null)} style={{margin: '10px 0'}}>
            Close Logs
          </button>
        </div>
      )}
    </div>
  )
}

export default App
