import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom'
import { useEffect, useState } from 'react'

import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Analyze from './pages/Analyze'
import History from './pages/History'
import AnalysisDetail from './pages/AnalysisDetail'
import Login from './pages/Login'
import Register from './pages/Register'

import { getMe } from './lib/api'

function Private({ children, user, onLogout }) {
  return user ? (
    <Layout user={user} onLogout={onLogout}>
      {children}
    </Layout>
  ) : (
    <Navigate to="/login" replace />
  )
}

function App() {
  const navigate = useNavigate()

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

  // Logout immediately
  const handleLogout = () => {
    setUser(null)

    navigate('/login', {
      replace: true,
    })
  }

  useEffect(() => {
    // Do not call /auth/me while already on auth pages
    const isAuthPage = ['/login', '/register'].includes(
      window.location.pathname
    )

    if (isAuthPage) {
      setLoading(false)
      return
    }

    refetchUser().finally(() => {
      setLoading(false)
    })
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

      {/* LOGIN */}
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/" replace />
          ) : (
            <Login onLoginSuccess={refetchUser} />
          )
        }
      />

      {/* REGISTER */}
      <Route
        path="/register"
        element={
          user ? (
            <Navigate to="/" replace />
          ) : (
            <Register onRegisterSuccess={refetchUser} />
          )
        }
      />

      {/* DASHBOARD */}
      <Route
        path="/"
        element={
          <Private
            user={user}
            onLogout={handleLogout}
          >
            <Dashboard />
          </Private>
        }
      />

      {/* ANALYZE */}
      <Route
        path="/analyze"
        element={
          <Private
            user={user}
            onLogout={handleLogout}
          >
            <Analyze />
          </Private>
        }
      />

      {/* HISTORY */}
      <Route
        path="/history"
        element={
          <Private
            user={user}
            onLogout={handleLogout}
          >
            <History />
          </Private>
        }
      />

      {/* ANALYSIS DETAIL */}
      <Route
        path="/analysis/:id"
        element={
          <Private
            user={user}
            onLogout={handleLogout}
          >
            <AnalysisDetail />
          </Private>
        }
      />

      {/* UNKNOWN ROUTE */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

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