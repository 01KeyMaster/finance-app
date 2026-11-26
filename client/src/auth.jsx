import { createContext, useContext, useState } from 'react'
import { apiFetch } from './api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('finance.token'))
  const [email, setEmail] = useState(() => localStorage.getItem('finance.email') || '')

  const auth = async (mode, emailValue, password) => {
    const res = await apiFetch(`/auth/${mode}`, {
      method: 'POST',
      body: JSON.stringify({ email: emailValue, password })
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Что-то пошло не так')
    }
    localStorage.setItem('finance.token', data.token)
    localStorage.setItem('finance.email', data.email)
    setToken(data.token)
    setEmail(data.email)
  }

  const login = (emailValue, password) => auth('login', emailValue, password)
  const register = (emailValue, password) => auth('register', emailValue, password)

  const logout = () => {
    localStorage.removeItem('finance.token')
    localStorage.removeItem('finance.email')
    setToken(null)
    setEmail('')
  }

  return (
    <AuthContext.Provider value={{ token, email, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth нужно вызывать внутри AuthProvider')
  }
  return ctx
}
