import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import Keypad from '../components/Keypad.jsx'
import { useStore } from '../store.jsx'
import { categories, currencies, symbolOf } from '../data/constants.js'

function compute(a, op, b) {
  let result = a
  if (op === '+') result = a + b
  if (op === '−') result = a - b
  if (op === '×') result = a * b
  if (op === '÷') result = b === 0 ? a : a / b
  return Math.round(result * 100) / 100
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function AddOperation() {
  const navigate = useNavigate()
  const { settings, addOperation } = useStore()

  const [type, setType] = useState('expense')
  const [category, setCategory] = useState('Еда')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(today())
  const [currency, setCurrency] = useState(settings.currency)
  const [showCurrency, setShowCurrency] = useState(false)

  const [current, setCurrent] = useState('0')
  const [previous, setPrevious] = useState(null)
  const [op, setOp] = useState(null)
  const [justEvaluated, setJustEvaluated] = useState(false)

  const handleKey = (k) => {
    if (k.action === 'digit') {
      if (justEvaluated) {
        setCurrent(k.value)
        setJustEvaluated(false)
      } else {
        setCurrent((c) => (c === '0' ? k.value : c + k.value))
      }
    }
    if (k.action === 'dot') {
      if (justEvaluated) {
        setCurrent('0.')
        setJustEvaluated(false)
      } else if (!current.includes('.')) {
        setCurrent((c) => c + '.')
      }
    }
    if (k.action === 'op') {
      let base = current
      if (previous !== null && op !== null && !justEvaluated) {
        base = String(compute(parseFloat(previous), op, parseFloat(current)))
      }
      setPrevious(base)
      setOp(k.value)
      setCurrent('0')
      setJustEvaluated(false)
    }
    if (k.action === 'equals' && previous !== null && op !== null) {
      setCurrent(String(compute(parseFloat(previous), op, parseFloat(current))))
      setPrevious(null)
      setOp(null)
      setJustEvaluated(true)
    }
    if (k.action === 'clear') {
      setCurrent('0')
      setPrevious(null)
      setOp(null)
      setJustEvaluated(false)
    }
    if (k.action === 'back') {
      if (justEvaluated) {
        setCurrent('0')
        setJustEvaluated(false)
      } else {
        setCurrent((c) => (c.length > 1 ? c.slice(0, -1) : '0'))
      }
    }
  }

  const finalAmount =
    previous !== null && op !== null
      ? compute(parseFloat(previous), op, parseFloat(current))
      : parseFloat(current)

  const save = async () => {
    if (!finalAmount || finalAmount <= 0) return
    await addOperation({ amount: finalAmount, type, category, note: note.trim(), date, currency })
    navigate('/')
  }

  return (
    <div className="screen">
      <header className="add-top">
        <button className="icon-btn" type="button" aria-label="Назад" onClick={() => navigate('/')}>
          <Icon name="back" size={20} />
        </button>
        <div className="add-title">Новая операция</div>
      </header>

      <div className="scroll add-scroll">

        <div className="segment">
          <button
            type="button"
            className={`segment-btn expense ${type === 'expense' ? 'active' : ''}`}
            onClick={() => setType('expense')}
          >
            Расход
          </button>
          <button
            type="button"
            className={`segment-btn income ${type === 'income' ? 'active' : ''}`}
            onClick={() => setType('income')}
          >
            Доход
          </button>
        </div>

        <div className="amount-block">
          {previous !== null && op !== null && (
            <div className="amount-expr">{previous} {op}</div>
          )}
          <div className="amount-row">
            <span className="amount-value">{current}</span>
            <div className="currency-wrap">
              <button className="currency-btn" type="button" onClick={() => setShowCurrency((v) => !v)}>
                {symbolOf(currency)} {currency}
                <Icon name="chevron" size={15} color="#AEB4C0" />
              </button>
              {showCurrency && (
                <div className="currency-menu">
                  {currencies.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      className="currency-item"
                      onClick={() => { setCurrency(c.code); setShowCurrency(false) }}
                    >
                      <span>{c.symbol} {c.code}</span>
                      <span className="currency-name">{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="field-label">Категория</div>
        <div className="chips">
          {categories.map((cat) => (
            <button
              key={cat.name}
              type="button"
              className={`chip ${category === cat.name ? 'active' : ''}`}
              onClick={() => setCategory(cat.name)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <label className="field-label" htmlFor="date">Дата</label>
        <div className="date-field">
          <Icon name="calendar" size={18} color="#AEB4C0" />
          <input
            id="date"
            type="date"
            className="date-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <label className="field-label" htmlFor="note">Заметка</label>
        <input
          id="note"
          type="text"
          className="input"
          placeholder="Например: продукты на неделю"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <Keypad onKey={handleKey} />
      </div>

      <div className="add-footer">
        <button className="primary-btn" type="button" onClick={save}>
          {type === 'expense' ? 'Добавить расход' : 'Добавить доход'}
        </button>
      </div>
    </div>
  )
}
