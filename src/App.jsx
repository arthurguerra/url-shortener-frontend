import { useEffect, useState } from 'react'
import api from './api'

function App() {
  const [urls, setUrls] = useState([])
  const [newUrl, setNewUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0
  });

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = (page = 0, size = 10) => {
    api.get(`/links?page=${page}&size=${size}`)
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
    api.post("/shorten", { url: newUrl })
    .then((response) => {
      fetchUrls();
      setNewUrl('');
    })
    .catch((error) => {
      setErrorMessage(error.response?.data?.message || 'An error occurred');
    })
  }

  const handlePageSizeChange = (newSize) => {
    fetchUrls(0, newSize);
  }

  return (
    <div>
      <h1>URL Shortener</h1>

      <form onSubmit={handleSubmit}>
        <input
         type='text' 
         value={newUrl} 
         onChange={(e) => setNewUrl(e.target.value)} 
         placeholder='Enter a URL'/>
         <button type="submit">Shorten</button>
      </form>

      {errorMessage && (
        <div style={{color: 'red', margin: '10px 0'}}>
          {errorMessage}
        </div>
      )}

      <div style={{margin: '10px 0'}}>
        Show: 
        <select 
          value={pagination.size} 
          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          style={{margin: '0 10px'}}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        results per page
      </div>

      <table>
        <thead>
          <tr>
            <th>Original URL</th>
            <th>Shortened URL</th>
            <th>Clicks</th>
          </tr>
        </thead>
        <tbody>
          {urls && urls.map((url) => (
            <tr key={url.shortUrl}>
              <td>
                <a href={url.originalUrl} target='_blank'>
                  {url.originalUrl}
                </a>
              </td>
              <td>{url.shortUrl}</td>
              <td>{url.clicks}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{margin: '10px 0', textAlign: 'center'}}>
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
    </div>
  )
}

export default App
