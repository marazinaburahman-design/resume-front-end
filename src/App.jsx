import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Analyze from './pages/Analyze'
import History from './pages/History'
import AnalysisDetail from './pages/AnalysisDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import { getMe } from './lib/api'

function Private({ children, user }) {
  return user ? (
    <Layout user={user}>{children}</Layout>
  ) : (
    <Navigate to="/login" replace />
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refetchUser = async () => {
    try {
      const userData = await getMe()
      setUser(userData)
      return userData
    } catch (err) {
      setUser(null)
      return null
    }
  }

  useEffect(() => {
    // Do not call /auth/me while the user is already on an auth page.
    // This avoids spending the backend rate-limit budget before login/register.
    const isAuthPage = ['/login', '/register'].includes(window.location.pathname)

    if (isAuthPage) {
      setLoading(false)
      return
    }

    refetchUser().finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#09090b] text-lime-300">
        Loading…
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" /> : <Login onLoginSuccess={refetchUser} />}
      />
      <Route
        path="/register"
        element={
          user ? <Navigate to="/" /> : <Register onRegisterSuccess={refetchUser} />
        }
      />
      <Route
        path="/"
        element={
          <Private user={user}>
            <Dashboard />
          </Private>
        }
      />
      <Route
        path="/analyze"
        element={
          <Private user={user}>
            <Analyze />
          </Private>
        }
      />
      <Route
        path="/history"
        element={
          <Private user={user}>
            <History />
          </Private>
        }
      />
      <Route
        path="/analysis/:id"
        element={
          <Private user={user}>
            <AnalysisDetail />
          </Private>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default function Root() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}
