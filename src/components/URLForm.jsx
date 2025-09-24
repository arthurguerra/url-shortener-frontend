import { useState } from "react";
import { Button } from "@/components/ui/button"
import apiClient from "../services/apiClient";

function URLForm({ onUrlCreation }) {
  const [newUrl, setNewUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      await apiClient.createUrl(newUrl, customCode.trim() || null);
      if (onUrlCreation) {
        onUrlCreation();
      }
      setNewUrl("");
      setCustomCode("");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "An error occurred");
    }
  };

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">URL Shortener</h1>
        <p className="text-gray-400">Create and manage your shortened URLs</p>
      </div>
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create Short URL</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Original URL *
            </label>
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://example.com"
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Custom Short Code (Optional)
            </label>
            <input
              type="text"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              placeholder="my-custom-code"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200"
          >
            Create Short URL
          </Button>
        </form>

        {errorMessage && (
          <div className="mt-4 p-4 bg-red-900 border border-red-700 rounded-md text-red-200 relative">
            <Button
              onClick={() => setErrorMessage("")}
              size="sm"
              className="absolute top-2 right-2 text-red-300 hover:text-red-100 text-xl font-bold"
            >
              X
            </Button>
            {errorMessage}
          </div>
        )}
      </div>
    </>
  );
}

export default URLForm;
