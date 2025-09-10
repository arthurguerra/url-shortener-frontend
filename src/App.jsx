import { useEffect, useState } from 'react'
import api from './api'

function App() {
  const [urls, setUrls] = useState([])
  const [newUrl, setNewUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = () => {
    api.get("/links")
    .then((response) => {
      setUrls(response.data.content);
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
    </div>
  )
}

export default App
