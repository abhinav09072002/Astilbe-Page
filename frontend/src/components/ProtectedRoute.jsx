import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * Wraps a route so only authenticated users can access it.
 * Unauthenticated users are redirected to /login,
 * with the original path saved in location.state.from
 * so Login can redirect back after success.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  // While checking token (on first load), show nothing / loader
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 20, height: 20,
          border: '1.5px solid rgba(255,255,255,.1)',
          borderTop: '1.5px solid rgba(255,255,255,.5)',
          borderRadius: '50%',
          animation: 'spin .7s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}
