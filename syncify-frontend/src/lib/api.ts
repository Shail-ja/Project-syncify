import { supabase } from "./supabase";

export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 
                            (import.meta as any).env?.VITE_BACKEND_URL || 
                            "http://localhost:3000";

// Log the API URL in development for debugging
if (import.meta.env.DEV) {
  console.log("🔗 API Base URL:", API_BASE_URL);
}

async function getAuthToken(): Promise<string | null> {
  // Always get token from Supabase session - never use stale localStorage tokens
  try {
    // Get current session from Supabase
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.warn("Supabase session error:", error);
      // Clear any invalid stored token
      localStorage.removeItem("token");
      return null;
    }
    
    // If we have a valid session with access token, use it
    if (session?.access_token) {
      // Update localStorage for reference (but we always use Supabase session)
      localStorage.setItem("token", session.access_token);
      return session.access_token;
    }
    
    // No active session - try to refresh if we have a refresh token
    // This handles cases where the session expired but refresh token is still valid
    if (session?.refresh_token) {
      try {
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession(session);
        if (!refreshError && refreshedSession?.access_token) {
          localStorage.setItem("token", refreshedSession.access_token);
          return refreshedSession.access_token;
        }
      } catch (refreshErr) {
        console.warn("Failed to refresh Supabase session:", refreshErr);
      }
    }
    
    // No valid Supabase session found - clear any stored tokens
    // After proper logout, Supabase session is cleared, so any stored token is stale
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    return null;
  } catch (err) {
    console.error("Failed to get Supabase session:", err);
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    return null;
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const token = await getAuthToken();
  if (!token) {
    // Provide helpful error message
    const errorMsg = "No Supabase authentication session found. Please sign in to continue.";
    // Redirect to sign in if not already there
    if (typeof window !== "undefined" && window.location.pathname !== "/signin") {
      console.warn(errorMsg);
      window.location.href = "/signin";
    }
    throw new Error(errorMsg);
  }
  
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  headers["Authorization"] = `Bearer ${token}`;
  
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers,
  });
  
  if (!res.ok) {
    // Handle 401 Unauthorized - token is invalid
    if (res.status === 401) {
      localStorage.removeItem("token");
      // Try to get fresh session one more time
      const freshToken = await getAuthToken();
      if (freshToken) {
        // Retry with fresh token
        headers["Authorization"] = `Bearer ${freshToken}`;
        const retryRes = await fetch(`${API_BASE_URL}${path}`, {
          method: "GET",
          headers,
        });
        if (retryRes.ok) {
          return retryRes.json();
        }
      }
      // If retry failed, redirect to login
      if (typeof window !== "undefined" && window.location.pathname !== "/signin") {
        window.location.href = "/signin";
      }
      throw new Error("Session expired. Please login again.");
    }
    
    const errorText = await res.text();
    let errorMessage = errorText;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error || errorJson.message || errorText;
    } catch {
      // If parsing fails, use the raw text
    }
    throw new Error(errorMessage);
  }
  
  return res.json();
}

export async function apiPost<T>(path: string, body?: unknown, options?: { headers?: Record<string, string>; skipAuth?: boolean }): Promise<T> {
  // Get Supabase auth token (unless one is provided in options or auth is skipped)
  const providedToken = options?.headers?.Authorization?.replace("Bearer ", "");
  let token: string | null = null;
  
  // Check if this is an auth endpoint that doesn't require authentication
  const isAuthEndpoint = path.startsWith("/auth/login") || path.startsWith("/auth/register") || path.startsWith("/auth/token");
  
  // Skip auth check if explicitly requested or if it's an auth endpoint
  const shouldSkipAuth = options?.skipAuth === true || isAuthEndpoint;
  
  if (shouldSkipAuth) {
    // Don't require auth for these endpoints - only use provided token if available
    if (providedToken) {
      token = providedToken;
    }
    // token remains null, which is fine for unauthenticated requests
  } else {
    // For protected routes, get the token
    if (providedToken) {
      token = providedToken;
    } else {
      token = await getAuthToken();
      if (!token) {
        throw new Error("No Supabase authentication session found. Please sign in.");
      }
    }
  }
  
  const headers: Record<string, string> = { "Content-Type": "application/json", ...options?.headers };
  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const url = `${API_BASE_URL}${path}`;
  
  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!res.ok) {
      // Handle 401 Unauthorized - token is invalid
      if (res.status === 401) {
        // Clear invalid token
        localStorage.removeItem("token");
        // Try to get fresh Supabase session one more time
        const freshToken = await getAuthToken();
        if (freshToken) {
          // Retry with fresh token
          headers["Authorization"] = `Bearer ${freshToken}`;
          const retryRes = await fetch(url, {
            method: "POST",
            headers,
            body: body ? JSON.stringify(body) : undefined,
          });
          if (retryRes.ok) {
            return retryRes.json();
          }
        }
        // If retry failed, redirect to login
        if (typeof window !== "undefined" && window.location.pathname !== "/signin") {
          window.location.href = "/signin";
        }
        throw new Error("Session expired. Please login again.");
      }
      
      const errorText = await res.text();
      let errorMessage = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || errorText;
      } catch {
        // If parsing fails, use the raw text
      }
      throw new Error(errorMessage);
    }
    return res.json();
  } catch (error: any) {
    // Handle network errors (failed to fetch)
    if (error.message === "Failed to fetch" || error.name === "TypeError") {
      console.error(`❌ Network error: Cannot reach backend at ${url}`);
      console.error("Make sure the backend server is running on:", API_BASE_URL);
      throw new Error(`Cannot connect to backend server. Is it running on ${API_BASE_URL}?`);
    }
    throw error;
  }
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("No Supabase authentication session found. Please sign in.");
  }
  
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  headers["Authorization"] = `Bearer ${token}`;
  const url = `${API_BASE_URL}${path}`;
  
  try {
    const res = await fetch(url, {
      method: "PUT",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!res.ok) {
      // Handle 401 Unauthorized - token is invalid
      if (res.status === 401) {
        localStorage.removeItem("token");
        // Try to get fresh session one more time
        const freshToken = await getAuthToken();
        if (freshToken) {
          // Retry with fresh token
          headers["Authorization"] = `Bearer ${freshToken}`;
          const retryRes = await fetch(url, {
            method: "PUT",
            headers,
            body: body ? JSON.stringify(body) : undefined,
          });
          if (retryRes.ok) {
            return retryRes.json();
          }
        }
        // If retry failed, redirect to login
        if (typeof window !== "undefined" && window.location.pathname !== "/signin") {
          window.location.href = "/signin";
        }
        throw new Error("Session expired. Please login again.");
      }
      
      const errorText = await res.text();
      let errorMessage = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || errorText;
      } catch {
        // If parsing fails, use the raw text
      }
      throw new Error(errorMessage);
    }
    return res.json();
  } catch (error: any) {
    // Handle network errors (failed to fetch)
    if (error.message === "Failed to fetch" || error.name === "TypeError") {
      console.error(`❌ Network error: Cannot reach backend at ${url}`);
      console.error("Make sure the backend server is running on:", API_BASE_URL);
      throw new Error(`Cannot connect to backend server. Is it running on ${API_BASE_URL}?`);
    }
    throw error;
  }
}


