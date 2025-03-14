/**
 * API client for making requests to the server
 */

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  signal?: AbortSignal;
}

export async function apiRequest(
  method: HttpMethod,
  endpoint: string,
  data?: any,
  options?: RequestOptions
): Promise<Response> {
  const url = endpoint.startsWith('/')
    ? `${process.env.NEXT_PUBLIC_API_URL || ''}${endpoint}`
    : endpoint;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers || {}),
  };

  const config: RequestInit = {
    method,
    headers,
    credentials: options?.credentials || 'include',
    signal: options?.signal,
  };

  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    // Try to parse error message from response
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.status}`);
    } catch (e) {
      if (e instanceof SyntaxError) {
        // If the response is not valid JSON
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      throw e;
    }
  }

  return response;
}

/**
 * Convenience methods for common HTTP methods
 */
export const api = {
  get: (endpoint: string, options?: RequestOptions) =>
    apiRequest('GET', endpoint, undefined, options),

  post: (endpoint: string, data: any, options?: RequestOptions) =>
    apiRequest('POST', endpoint, data, options),

  put: (endpoint: string, data: any, options?: RequestOptions) =>
    apiRequest('PUT', endpoint, data, options),

  delete: (endpoint: string, options?: RequestOptions) =>
    apiRequest('DELETE', endpoint, undefined, options),

  patch: (endpoint: string, data: any, options?: RequestOptions) =>
    apiRequest('PATCH', endpoint, data, options),
};
