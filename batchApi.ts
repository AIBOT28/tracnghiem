export interface BatchRequest {
  url: string;
  method?: string;
  body?: any;
}

export interface BatchResponse {
  url: string;
  status: number;
  data: any;
}

/**
 * Sends multiple requests in parallel and returns their results.
 * This can be expanded later to use a single /batch endpoint if the backend supports it.
 */
export async function sendBatchRequest(baseUrl: string, requests: BatchRequest[]): Promise<BatchResponse[]> {
  const promises = requests.map(async (req) => {
    // Construct the full URL.
    // Ensure we don't have double slashes between baseUrl and req.url
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = req.url.startsWith('/') ? req.url : `/${req.url}`;
    const fullUrl = `${cleanBaseUrl}${cleanPath}`;
      
    try {
      const response = await fetch(fullUrl, {
        method: req.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'version': '10' // Matching constants.ts API_HEADERS
        },
        body: req.body ? JSON.stringify(req.body) : undefined,
      });
      
      const data = await response.json();
      return {
        url: req.url,
        status: response.status,
        data,
      };
    } catch (error) {
      console.error(`Batch request failed for ${fullUrl}:`, error);
      return {
        url: req.url,
        status: 500,
        data: null,
      };
    }
  });

  return Promise.all(promises);
}
