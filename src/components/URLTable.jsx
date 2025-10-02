import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useUrls } from "@/UrlsContext";

function URLTable({ onViewLogs }) {
  const { urls, fetchUrls, deleteUrl } = useUrls();
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });
  const [sorting, setSorting] = useState({
    sortBy: "createdAt",
    sortDirection: "DESC",
  });

  const getUrls = async (page, size, sortBy, sortDirection) => {
      try {
        const data = await fetchUrls(page, size, sortBy, sortDirection);
        setPagination({
          page: data.number,
          size: data.size,
          totalPages: data.totalPages,
          totalElements: data.totalElements,
        });
      } catch (error) {
        console.log("API error:", error);
      }
    }

    useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  const handleSort = (field) => {
    const newDirection =
      sorting.sortBy === field && sorting.sortDirection === "ASC"
        ? "DESC"
        : "ASC";
    setSorting({ sortBy: field, sortDirection: newDirection });
    getUrls(0, pagination.size, field, newDirection);
  };

  const handleDeleteUrl = async (shortCode) => {
    try {
      await deleteUrl(shortCode);
      getUrls();
    } catch (error) {
      console.log("Delete error:", error);
    }
  };

  const handlePageSizeChange = (newSize) => {
    getUrls(0, newSize);
  };

  return (
    <>
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Your URLs</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th
                  onClick={() => handleSort("createdAt")}
                  className="text-left py-3 px-4 font-medium text-gray-300 cursor-pointer hover:text-white select-none"
                >
                  Created At{" "}
                  {sorting.sortBy === "createdAt" &&
                    (sorting.sortDirection === "ASC" ? "↑" : "↓")}
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-300">
                  Original URL
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-300">
                  Short URL
                </th>
                <th
                  onClick={() => handleSort("clicks")}
                  className="text-left py-3 px-4 font-medium text-gray-300 cursor-pointer hover:text-white select-none"
                >
                  Clicks{" "}
                  {sorting.sortBy === "clicks" &&
                    (sorting.sortDirection === "ASC" ? "↑" : "↓")}
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {urls &&
                urls.map((url) => (
                  <tr
                    key={url.shortUrl}
                    className="border-b border-gray-700 hover:bg-gray-750"
                  >
                    <td className="py-3 px-4 text-gray-300">{url.createdAt}</td>
                    <td className="py-3 px-4">
                      <a
                        href={url.originalUrl}
                        target="_blank"
                        className="text-blue-400 hover:text-blue-300 underline truncate block max-w-xs"
                      >
                        {url.originalUrl}
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={`http://localhost:8080/${url.shortUrl}`}
                        target="_blank"
                        className="text-green-400 hover:text-green-300 underline"
                      >
                        {url.shortUrl}
                      </a>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{url.clicks}</td>
                    <td className="py-3 px-4 space-x-2">
                      <Button
                        onClick={() => onViewLogs(url.shortUrl)}
                        disabled={url.clicks === 0}
                        variant="secondary"
                        size="sm"
                        className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                      >
                        View Logs
                      </Button>
                      <Button
                        onClick={() => handleDeleteUrl(url.shortUrl)}
                        variant="destructive"
                        size="sm"
                        className="bg-red-700 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            Showing {pagination.page * pagination.size + 1}-
            {pagination.page * pagination.size + urls.length} of{" "}
            {pagination.totalElements} results
          </div>

          <div className="flex items-center space-x-4">
            <Button
              onClick={() => getUrls(pagination.page - 1, pagination.size)}
              disabled={pagination.page === 0}
              className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
            >
              Previous
            </Button>
            <span className="text-sm text-gray-300">
              Page {pagination.page + 1} of {pagination.totalPages}
            </span>
            <Button
              onClick={() => getUrls(pagination.page + 1, pagination.size)}
              disabled={pagination.page >= pagination.totalPages - 1}
              className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
            >
              Next
            </Button>
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
    </>
  );
}

export default URLTable;
