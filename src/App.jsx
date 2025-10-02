import { useEffect, useState, useCallback, useRef } from 'react'
import { Button } from "@/components/ui/button"
import apiClient from './services/apiClient'
import URLForm from './components/URLForm';
import URLTable from './components/URLTable';
import { UrlsProvider } from './UrlsContext';

function App() {
  const tableRef = useRef()
  const [selectedShortCode, setSelectedShortCode] = useState(null);
  const [selectedLogs, setSelectedLogs] = useState(null);
  const [allLogs, setAllLogs] = useState([]);
  const [logsPage, setLogsPage] = useState(0);
  const [logsPageSize, setLogsPageSize] = useState(10);
  const [logsSortDirection, setLogsSortDirection] = useState('DESC');


  const getLogs = async (shortCode) => {
    try {
      const logs = await apiClient.getLogs(shortCode)
      setSelectedLogs(logs);
      setAllLogs(logs.logs);
      setLogsPage(0);
      setTimeout(() => {
        document.getElementById('logs-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.log('Logs error:', error);
    }
  }

  const getSortedLogs = () => {
    return [...allLogs].sort((a, b) => {
      const dateA = new Date(a.accessedAt);
      const dateB = new Date(b.accessedAt);
      return logsSortDirection === 'DESC' ? dateB - dateA : dateA - dateB;
    });
  }

  const getPaginatedLogs = () => {
    const sortedLogs = getSortedLogs();
    const startIndex = logsPage * logsPageSize;
    const endIndex = startIndex + logsPageSize;
    return sortedLogs.slice(startIndex, endIndex);
  }

  const getTotalLogsPages = () => {
    return Math.ceil(allLogs.length / logsPageSize);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto p-6">

        <UrlsProvider>
          <URLForm/>
          <URLTable onViewLogs={getLogs} />
        </UrlsProvider>
        

        {/* Logs Card */}
        {selectedLogs && (
          <div id="logs-section" className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Access Logs for {selectedLogs.shortUrl}</h2>
              <Button 
                onClick={() => {
                  setSelectedLogs(null);
                  setAllLogs([]);
                  setLogsPage(0);
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
              >
                Close
              </Button>
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
            
            {allLogs.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No logs found</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-300">IP Address</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-300">User Agent</th>
                        <th 
                          onClick={() => setLogsSortDirection(logsSortDirection === 'ASC' ? 'DESC' : 'ASC')}
                          className="text-left py-3 px-4 font-medium text-gray-300 cursor-pointer hover:text-white select-none"
                        >
                          Accessed At {logsSortDirection === 'ASC' ? '↑' : '↓'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginatedLogs().map((log, index) => (
                        <tr key={index} className="border-b border-gray-700">
                          <td className="py-3 px-4 text-gray-300 font-mono text-sm">{log.ip}</td>
                          <td className="py-3 px-4 text-gray-300 text-sm truncate max-w-xs">{log.userAgent}</td>
                          <td className="py-3 px-4 text-gray-300 text-sm">{new Date(log.accessedAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Client-side Logs Pagination */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-700">
                  <div className="text-sm text-gray-400">
                    Showing {logsPage * logsPageSize + 1}-{Math.min((logsPage + 1) * logsPageSize, allLogs.length)} of {allLogs.length} logs
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Button 
                      onClick={() => setLogsPage(logsPage - 1)}
                      disabled={logsPage === 0}
                      className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-300">
                      Page {logsPage + 1} of {getTotalLogsPages()}
                    </span>
                    <Button 
                      onClick={() => setLogsPage(logsPage + 1)}
                      disabled={logsPage >= getTotalLogsPages() - 1}
                      className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                    >
                      Next
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-400">Show:</span>
                    <select 
                      value={logsPageSize} 
                      onChange={(e) => {
                        setLogsPageSize(Number(e.target.value));
                        setLogsPage(0);
                      }}
                      className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="text-gray-400">per page</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App