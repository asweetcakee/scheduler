import { ApiError } from './apiError'

export const handleResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
        const body = await response.json().catch(() => null)
        const message = 
            body && typeof body === 'object' && 'error' in body
                ? String(body.error)
                : `HTTP error ${response.status}`
        throw new ApiError(response.status, body, message)
    }
    return response.json()
}