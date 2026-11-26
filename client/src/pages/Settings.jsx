import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { useStore } from '../store.jsx'
import { useAuth } from '../auth.jsx'
import { currencies } from '../data/constants.js'

export default function Settings() {
  const navigate = useNavigate()
  const { settings, setCurrency, setName, clearAll, operations } = useStore()
  const { email, logout } = useAuth()

  const onClear = () => {
    if (operations.length === 0) return
    if (window.confirm('Удалить все операции? Это нельзя отменить.')) {
      clearAll()
    }
  }

  return (
    <div className="screen">
      <header className="add-top">
        <button className="icon-btn" type="button" aria-label="Назад" onClick={() => navigate('/')}>
          <Icon name="back" size={20} />
        </button>
        <div className="add-title">Настройки</div>
      </header>

      <div className="scroll add-scroll">

        <div className="field-label">Аккаунт</div>
        <div className="account-row">{email}</div>

        <label className="field-label" htmlFor="name">Как к вам обращаться</label>
        <input
          id="name"
          type="text"
          className="input"
          placeholder="Например: Вадим"
          value={settings.name || ''}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="field-label">Основная валюта</div>
        <div className="settings-list">
          {currencies.map((c) => (
            <button
              key={c.code}
              type="button"
              className="settings-row"
              onClick={() => setCurrency(c.code)}
            >
              <div className="settings-main">
                <span className="settings-symbol">{c.symbol}</span>
                <span>{c.name}</span>
                <span className="settings-code">{c.code}</span>
              </div>
              {settings.currency === c.code && <Icon name="check" size={20} color="#3FCF8E" />}
            </button>
          ))}
        </div>

        <div className="field-label">Данные</div>
        <button type="button" className="danger-btn" onClick={onClear}>
          <Icon name="trash" size={18} color="#FB7185" />
          Удалить все операции
        </button>

        <button type="button" className="logout-btn" onClick={logout}>
          Выйти из аккаунта
        </button>

      </div>
    </div>
  )
}
