// Environment configuration
export const ENV = {
  // Development mode
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // API configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE || '/api',
  
  // Feature flags
  enableDevTools: import.meta.env.DEV,
  
  // Debug settings
  enableDebugLogs: import.meta.env.DEV,
} as const;

// Helper for authenticated API calls
export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (options.body && typeof options.body === "string") {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(ENV.apiBaseUrl + path, {
    ...options,
    headers,
  });

  return response;
}

// Helper to log only in development
export const devLog = (...args: any[]) => {
  if (ENV.enableDebugLogs) {
    console.log('[DEV]', ...args);
  }
};
