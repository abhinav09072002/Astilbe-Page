import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { apiGetMe } from '../utils/api.js'

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null)

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)   // { id, name, email, savedIdeas, ... }
  const [loading, setLoading] = useState(true)   // true while checking stored token

  // On app mount: try to restore session from localStorage token
  useEffect(() => {
    const token = localStorage.getItem('ap_token')
    if (!token) {
      setLoading(false)
      return
    }
    // Verify token is still valid by fetching /api/auth/me
    apiGetMe()
      .then(data => {
        if (data.success) setUser(data.user)
        else clearAuth()
      })
      .catch(() => clearAuth())
      .finally(() => setLoading(false))
  }, [])

  /** Called after successful login or signup */
  const loginUser = useCallback((token, userData) => {
    localStorage.setItem('ap_token', token)
    setUser(userData)
  }, [])

  /** Clear auth state and token */
  const logoutUser = useCallback(() => {
    clearAuth()
  }, [])

  /** Update user data (e.g. after saving ideas) */
  const updateUser = useCallback((updatedFields) => {
    setUser(prev => prev ? { ...prev, ...updatedFields } : prev)
  }, [])

  function clearAuth() {
    localStorage.removeItem('ap_token')
    setUser(null)
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, loginUser, logoutUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
