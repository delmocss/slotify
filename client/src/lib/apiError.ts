import axios from "axios"

/** Best human-readable message for a failed request. */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
) {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "Cannot reach the server. Check your connection and try again."
    }
    const message = (error.response.data as { message?: unknown } | undefined)?.message
    if (typeof message === "string" && message) return message
  }
  return fallback
}

export function getApiStatus(error: unknown) {
  return axios.isAxiosError(error) ? error.response?.status : undefined
}
