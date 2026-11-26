import { useEffect, useState } from 'react'
import BottomNav from '../components/BottomNav.jsx'
import Icon from '../components/Icon.jsx'
import { useStore } from '../store.jsx'
import { apiFetch } from '../api.js'
import { currencies, symbolOf } from '../data/constants.js'

function formatAmount(value) {
  if (value === null || !isFinite(value)) return '—'
  return value.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function Rates() {
  const { pairs, addPair, swapPair, deletePair } = useStore()

  const [rates, setRates] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [amount, setAmount] = useState('1')
  const [open, setOpen] = useState(false)
  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('ILS')

  const load = async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await apiFetch('/rates?base=USD')
      const json = await res.json()
      if (!res.ok) throw new Error()
      setRates(json.rates)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const amt = parseFloat(amount) || 0

  const convert = (f, t) => {
    if (!rates || !rates[f] || !rates[t]) return null
    return amt * (rates[t] / rates[f])
  }

  const save = async () => {
    if (from === to) return
    await addPair(from, to)
    setOpen(false)
  }

  return (
    <div className="screen">
      <div className="scroll">

        <header className="forecast-top">
          <div className="hello">Твои пары</div>
          <div className="forecast-title">Курс валют</div>
        </header>

        <label className="field-label" htmlFor="amount">Сумма для перевода</label>
        <input
          id="amount"
          type="number"
          inputMode="decimal"
          className="input amount-field"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Например: 100"
        />

        {loading && <div className="rates-note">Загружаю курсы…</div>}
        {error && <div className="rates-note">Не удалось получить курсы. Проверь интернет и обнови.</div>}

        {!loading && !error && pairs.length === 0 && !open && (
          <div className="rates-note">Пар пока нет. Добавь первую — например, доллар к шекелю.</div>
        )}

        {!error && (
          <ul className="rates-list">
            {pairs.map((p) => {
              const result = convert(p.fromCode, p.toCode)
              return (
                <li className="rate-row" key={p.id}>
                  <div className="rate-left">
                    <button className="swap-btn" type="button" aria-label="Развернуть" onClick={() => swapPair(p.id)}>
                      <Icon name="swap" size={18} color="#9FB4FF" />
                    </button>
                    <div>
                      <div className="rate-name">
                        {formatAmount(amt)} {symbolOf(p.fromCode)} {p.fromCode}
                      </div>
                      <div className="rate-sub">в {p.toCode}</div>
                    </div>
                  </div>
                  <div className="rate-right">
                    <div className="rate-value">{formatAmount(result)} {symbolOf(p.toCode)}</div>
                    <button className="op-del" type="button" aria-label="Удалить" onClick={() => deletePair(p.id)}>
                      <Icon name="trash" size={16} color="#6B7180" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {open ? (
          <div className="scenario-form">
            <div className="pair-selects">
              <select className="select" value={from} onChange={(e) => setFrom(e.target.value)}>
                {currencies.map((c) => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
              </select>
              <Icon name="arrow-right" size={18} color="#AEB4C0" />
              <select className="select" value={to} onChange={(e) => setTo(e.target.value)}>
                {currencies.map((c) => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
              </select>
            </div>
            <div className="form-actions">
              <button className="logout-btn form-cancel" type="button" onClick={() => setOpen(false)}>Отмена</button>
              <button className="primary-btn form-save" type="button" onClick={save}>Добавить</button>
            </div>
          </div>
        ) : (
          <button className="dashed-btn" type="button" onClick={() => setOpen(true)}>
            <Icon name="plus" size={17} color="#9FB4FF" strokeWidth={2.2} />
            Добавить пару
          </button>
        )}

        {!error && (
          <button className="dashed-btn rates-refresh" type="button" onClick={load}>
            <Icon name="chart" size={16} color="#9FB4FF" />
            Обновить курсы
          </button>
        )}

      </div>

      <BottomNav />
    </div>
  )
}
