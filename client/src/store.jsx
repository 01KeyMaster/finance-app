import { createContext, useContext, useEffect, useState } from 'react'
import { apiFetch } from './api.js'
import { useAuth } from './auth.jsx'

const StoreContext = createContext(null)

const SETTINGS_KEY = 'finance.settings'

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? JSON.parse(raw) : { currency: 'ILS' }
  } catch {
    return { currency: 'ILS' }
  }
}

export function StoreProvider({ children }) {
  const { token } = useAuth()
  const [operations, setOperations] = useState([])
  const [scenarios, setScenarios] = useState([])
  const [pairs, setPairs] = useState([])
  const [settings, setSettings] = useState(loadSettings)
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)

  const loadAll = async () => {
    setLoading(true)
    try {
      const [opsRes, scRes, prRes] = await Promise.all([
        apiFetch('/operations'),
        apiFetch('/scenarios'),
        apiFetch('/pairs')
      ])
      const ops = await opsRes.json()
      const sc = await scRes.json()
      const pr = await prRes.json()
      setOperations(Array.isArray(ops) ? ops : [])
      setScenarios(Array.isArray(sc) ? sc : [])
      setPairs(Array.isArray(pr) ? pr : [])
      setOffline(false)
    } catch {
      setOffline(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      loadAll()
    } else {
      setOperations([])
      setScenarios([])
      setPairs([])
    }
  }, [token])

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }, [settings])

  const addOperation = async (op) => {
    const res = await apiFetch('/operations', { method: 'POST', body: JSON.stringify(op) })
    if (res.ok) {
      const saved = await res.json()
      setOperations((prev) => [saved, ...prev])
    }
  }

  const deleteOperation = async (id) => {
    const res = await apiFetch(`/operations/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setOperations((prev) => prev.filter((o) => o.id !== id))
    }
  }

  const clearAll = async () => {
    for (const op of operations) {
      await apiFetch(`/operations/${op.id}`, { method: 'DELETE' })
    }
    setOperations([])
  }

  const addScenario = async (scenario) => {
    const res = await apiFetch('/scenarios', { method: 'POST', body: JSON.stringify(scenario) })
    if (res.ok) {
      const saved = await res.json()
      setScenarios((prev) => [...prev, saved])
    }
  }

  const toggleScenario = async (id, active) => {
    setScenarios((prev) => prev.map((s) => (s.id === id ? { ...s, active } : s)))
    await apiFetch(`/scenarios/${id}`, { method: 'PATCH', body: JSON.stringify({ active }) })
  }

  const deleteScenario = async (id) => {
    const res = await apiFetch(`/scenarios/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setScenarios((prev) => prev.filter((s) => s.id !== id))
    }
  }

  const addPair = async (fromCode, toCode) => {
    const res = await apiFetch('/pairs', { method: 'POST', body: JSON.stringify({ fromCode, toCode }) })
    if (res.ok) {
      const saved = await res.json()
      setPairs((prev) => [...prev, saved])
    }
  }

  const swapPair = async (id) => {
    const pair = pairs.find((p) => p.id === id)
    if (!pair) return
    const next = { fromCode: pair.toCode, toCode: pair.fromCode }
    setPairs((prev) => prev.map((p) => (p.id === id ? { ...p, ...next } : p)))
    await apiFetch(`/pairs/${id}`, { method: 'PATCH', body: JSON.stringify(next) })
  }

  const deletePair = async (id) => {
    const res = await apiFetch(`/pairs/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setPairs((prev) => prev.filter((p) => p.id !== id))
    }
  }

  const setCurrency = (currency) => {
    setSettings((prev) => ({ ...prev, currency }))
  }

  const setName = (name) => {
    setSettings((prev) => ({ ...prev, name }))
  }

  const income = operations
    .filter((o) => o.type === 'income')
    .reduce((sum, o) => sum + o.amount, 0)

  const expense = operations
    .filter((o) => o.type === 'expense')
    .reduce((sum, o) => sum + o.amount, 0)

  const balance = income - expense

  const value = {
    operations,
    scenarios,
    pairs,
    settings,
    totals: { income, expense, balance },
    loading,
    offline,
    addOperation,
    deleteOperation,
    clearAll,
    addScenario,
    toggleScenario,
    deleteScenario,
    addPair,
    swapPair,
    deletePair,
    setCurrency,
    setName
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) {
    throw new Error('useStore нужно вызывать внутри StoreProvider')
  }
  return ctx
}
