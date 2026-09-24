import axios from 'axios'

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    'https://resume-back-end-8gbp.vercel.app/api',
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')

      if (!['/login', '/register'].includes(window.location.pathname)) {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export async function getMe() {
  try {
    const { data } = await api.get('/auth/me')
    return data.user
  } catch (err) {
    if (err.response?.status === 401) {
      return null
    }

    throw err
  }
}