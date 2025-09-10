import { useEffect, useState } from 'react'
import api from './api'

function App() {
  const [urls, setUrls] = useState([])

  useEffect(() => {
    console.log('Making API call...');
    api.get("/links")
    .then((response) => {
      console.log('API response:', response);
      console.log('Response data:', response.data);
      setUrls(response.data.content);
    })
    .catch((error) => {
      console.log('API error:', error);
    })
  }, []);

  return (
    <div>
      <h1>URL Shortener</h1>

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
              <td><a href={url.originalUrl} target='_blank'>{url.originalUrl}</a></td>
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
