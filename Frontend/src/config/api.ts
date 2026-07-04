const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const getDefaultApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    return '/api';
  }

  const isLocalHost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  return isLocalHost ? 'http://localhost:5001/api' : '/api';
};

type ViteImportMeta = ImportMeta & {
  env?: {
    VITE_API_BASE_URL?: string;
  };
};

const envApiBaseUrl = (import.meta as ViteImportMeta).env?.VITE_API_BASE_URL;

export const API_BASE_URL = trimTrailingSlash(
  envApiBaseUrl || getDefaultApiBaseUrl()
);

export const AUTH_API_URL = `${API_BASE_URL}/auth`;
