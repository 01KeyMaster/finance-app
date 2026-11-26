import { useState } from 'react'
import { useAuth } from '../auth.jsx'

export default function Login() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'login') {
        await login(email.trim(), password)
      } else {
        await register(email.trim(), password)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="screen auth-screen">
      <div className="auth-box">
        <div className="auth-logo">Финансы</div>
        <div className="auth-subtitle">
          {mode === 'login' ? 'Вход в аккаунт' : 'Создать аккаунт'}
        </div>

        <form className="auth-form" onSubmit={submit}>
          <label className="field-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="input"
            placeholder="you@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="field-label" htmlFor="password">Пароль</label>
          <input
            id="password"
            type="password"
            className="input"
            placeholder="минимум 6 символов"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <div className="auth-error">{error}</div>}

          <button className="primary-btn auth-submit" type="submit" disabled={busy}>
            {busy ? 'Минутку…' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <button
          type="button"
          className="auth-switch"
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
        >
          {mode === 'login' ? 'Нет аккаунта? Создать' : 'Уже есть аккаунт? Войти'}
        </button>
      </div>
    </div>
  )
}
