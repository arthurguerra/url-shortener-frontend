import { createContext, useContext, useState, useEffect } from "react";
import apiClient from "./services/apiClient";

const UrlsContext = createContext();

export function UrlsProvider({ children }) {
  const [urls, setUrls] = useState([]);

  const fetchUrls = async (page = 0, size = 10, sortBy = 'createdAt', sortDirection = 'DESC') => {
    const data = await apiClient.getUrls(page, size, sortBy, sortDirection);
    setUrls(data.content);
    return data;
  }

  const createUrl = async (url, customCode = null) => {
    await apiClient.createUrl(url, customCode);
    fetchUrls();
  }

  useEffect(() => {
    fetchUrls();
  }, []);

  return (
    <UrlsContext.Provider value={{ urls, fetchUrls, createUrl }}>
      {children}
    </UrlsContext.Provider>
  );
}

export const useUrls = () => useContext(UrlsContext);