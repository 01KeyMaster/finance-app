import { useState } from 'react'
import BottomNav from '../components/BottomNav.jsx'
import Icon from '../components/Icon.jsx'
import { useStore } from '../store.jsx'
import { money, formatDate } from '../data/constants.js'

function sortByDate(a, b) {
  if (!a.date && !b.date) return a.id - b.id
  if (!a.date) return 1
  if (!b.date) return -1
  return a.date < b.date ? -1 : a.date > b.date ? 1 : 0
}

export default function Forecast() {
  const { totals, settings, scenarios, addScenario, toggleScenario, deleteScenario } = useStore()
  const cur = settings.currency

  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('income')
  const [date, setDate] = useState('')

  const sorted = [...scenarios].sort(sortByDate)

  let running = totals.balance
  const rows = sorted.map((s) => {
    const signed = s.type === 'income' ? s.amount : -s.amount
    if (s.active) running += signed
    return { ...s, signed, runningAfter: s.active ? running : null }
  })

  const final = rows.reduce((sum, s) => (s.active ? sum + s.signed : sum), totals.balance)

  const save = async () => {
    const value = parseFloat(amount)
    if (!title.trim() || !value || value <= 0) return
    await addScenario({ title: title.trim(), amount: value, type, date: date || null })
    setTitle('')
    setAmount('')
    setDate('')
    setType('income')
    setOpen(false)
  }

  return (
    <div className="screen">
      <div className="scroll">

        <header className="forecast-top">
          <div className="hello">Планы и прогноз</div>
          <div className="forecast-title">Прогноз</div>
        </header>

        <section className="forecast-card">
          <div className="balance-label">С учётом планов в кошельке будет</div>
          <div className="forecast-value">≈ {money(final, cur)}</div>
          <div className="spark-axis" style={{ marginTop: '10px' }}>
            <span>сейчас: {money(totals.balance, cur)}</span>
          </div>
        </section>

        <div className="section-title forecast-section">Запланированные платежи</div>

        {scenarios.length === 0 && !open && (
          <div className="rates-note">Пока нет планов. Добавь будущий платёж — например, «Зарплата 12.12».</div>
        )}

        {rows.map((s) => (
          <div className="scenario" key={s.id}>
            <div className="scenario-main">
              <div className="scenario-title">{s.title}</div>
              <div className="scenario-hint">
                {s.date && <span className="plan-date">{formatDate(s.date)}</span>}
                <span className={s.type}>{s.type === 'income' ? '+' : '−'}{money(s.amount, cur)}</span>
              </div>
            </div>
            {s.runningAfter !== null && (
              <div className="plan-run">→ {money(s.runningAfter, cur)}</div>
            )}
            <button
              type="button"
              role="switch"
              aria-checked={s.active}
              aria-label={s.title}
              className={`switch ${s.active ? 'on' : ''}`}
              onClick={() => toggleScenario(s.id, !s.active)}
            >
              <span className="knob" />
            </button>
            <button className="op-del" type="button" aria-label="Удалить" onClick={() => deleteScenario(s.id)}>
              <Icon name="trash" size={16} color="#6B7180" />
            </button>
          </div>
        ))}

        {open ? (
          <div className="scenario-form">
            <div className="segment">
              <button
                type="button"
                className={`segment-btn income ${type === 'income' ? 'active' : ''}`}
                onClick={() => setType('income')}
              >
                Доход
              </button>
              <button
                type="button"
                className={`segment-btn expense ${type === 'expense' ? 'active' : ''}`}
                onClick={() => setType('expense')}
              >
                Расход
              </button>
            </div>
            <input
              type="text"
              className="input"
              placeholder="Название, например: Зарплата"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="number"
              inputMode="decimal"
              className="input"
              placeholder="Сумма"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <label className="field-label" htmlFor="plan-date">Дата (необязательно)</label>
            <input
              id="plan-date"
              type="date"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <div className="form-actions">
              <button className="logout-btn form-cancel" type="button" onClick={() => setOpen(false)}>Отмена</button>
              <button className="primary-btn form-save" type="button" onClick={save}>Сохранить</button>
            </div>
          </div>
        ) : (
          <button className="dashed-btn" type="button" onClick={() => setOpen(true)}>
            <Icon name="plus" size={17} color="#9FB4FF" strokeWidth={2.2} />
            Добавить план
          </button>
        )}

      </div>

      <BottomNav />
    </div>
  )
}
