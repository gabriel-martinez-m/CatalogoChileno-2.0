export const GATEWAY_URL = 'http://localhost:8000'

export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `Error HTTP: ${response.status} ${response.statusText}`)
  }
  
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return response.json() as Promise<T>
  }
  
  return response.text() as unknown as Promise<T>
}
