import axios from "axios"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// A rejected session (expired token, or a demo sandbox that was already purged) must
// send the user back to the login instead of leaving every screen failing silently.
// Login/register 401s are ordinary "wrong credentials" answers and are left alone.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message
    const url: string = error.config?.url ?? ""
    const isAuthForm = url.startsWith("/auth/login") || url.startsWith("/auth/register")

    // 401 = the token is bad/expired. 403 only when the account no longer belongs to the
    // organization (e.g. an expired demo sandbox); any other 403 or a 5xx keeps the session.
    const sessionRejected =
      status === 401 || (status === 403 && message === "Forbidden: Invalid organization")

    if (sessionRejected && !isAuthForm && localStorage.getItem("token")) {
      localStorage.removeItem("token")
      if (window.location.pathname.startsWith("/dashboard")) {
        sessionStorage.setItem("slotify-session-ended", String(Date.now()))
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  }
)
