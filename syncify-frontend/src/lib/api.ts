export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 
                            (import.meta as any).env?.VITE_BACKEND_URL || 
                            "http://localhost:3000";

// Log the API URL in development for debugging
if (import.meta.env.DEV) {
  console.log("🔗 API Base URL:", API_BASE_URL);
}

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiPost<T>(path: string, body?: unknown, options?: { headers?: Record<string, string> }): Promise<T> {
  const headers = { ...getAuthHeaders(), ...options?.headers };
  const url = `${API_BASE_URL}${path}`;
  
  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!res.ok) {
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
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}


