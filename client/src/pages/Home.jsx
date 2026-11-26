import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import BottomNav from '../components/BottomNav.jsx'
import { useStore } from '../store.jsx'
import { money, signedMoney, iconOf, formatDate } from '../data/constants.js'

const monthNames = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
]

export default function Home() {
  const { operations, totals, settings, deleteOperation, offline } = useStore()
  const cur = settings.currency
  const name = settings.name && settings.name.trim() ? settings.name.trim() : 'друг'

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`
  const monthOps = operations.filter((o) => (o.date || '').slice(0, 7) === monthKey)

  const monthIncome = monthOps.filter((o) => o.type === 'income').reduce((s, o) => s + o.amount, 0)
  const monthExpense = monthOps.filter((o) => o.type === 'expense').reduce((s, o) => s + o.amount, 0)

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1) } else { setMonth(month - 1) }
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1) } else { setMonth(month + 1) }
  }

  return (
    <div className="screen">
      <div className="scroll">

        <header className="topbar">
          <div className="hello">Привет, {name}</div>
          <Link to="/settings" className="icon-btn" aria-label="Настройки">
            <Icon name="settings" size={20} />
          </Link>
        </header>

        {offline && (
          <div className="offline-banner">Нет связи с сервером. Проверь, запущен ли он.</div>
        )}

        <section className="balance-card">
          <div className="balance-label">Кошелёк · всего</div>
          <div className="balance-value">{money(totals.balance, cur)}</div>
        </section>

        <div className="month-switch month-row">
          <button className="month-arrow" type="button" aria-label="Прошлый месяц" onClick={prevMonth}>
            <Icon name="back" size={18} color="#AEB4C0" />
          </button>
          <span className="month-label">{monthNames[month]} {year}</span>
          <button className="month-arrow" type="button" aria-label="Следующий месяц" onClick={nextMonth}>
            <Icon name="arrow-right" size={18} color="#AEB4C0" />
          </button>
        </div>

        <div className="pills">
          <div className="pill">
            <div className="pill-head pill-income">
              <Icon name="up" size={15} strokeWidth={2.4} />
              Доходы
            </div>
            <div className="pill-value">{money(monthIncome, cur)}</div>
          </div>
          <div className="pill">
            <div className="pill-head pill-expense">
              <Icon name="down" size={15} strokeWidth={2.4} />
              Расходы
            </div>
            <div className="pill-value">{money(monthExpense, cur)}</div>
          </div>
        </div>

        <div className="section-head">
          <div className="section-title">Операции за месяц</div>
        </div>

        {monthOps.length === 0 ? (
          <div className="empty">
            <div className="empty-title">В этом месяце пусто</div>
            <div className="empty-text">Нажми «+», чтобы добавить операцию</div>
          </div>
        ) : (
          <ul className="op-list">
            {monthOps.map((op) => (
              <li className="op" key={op.id}>
                <div className={`op-icon ${op.type}`}>
                  <Icon name={op.type === 'income' ? 'wallet' : iconOf(op.category)} size={20} />
                </div>
                <div className="op-main">
                  <div className="op-title">{op.note || op.category}</div>
                  <div className="op-sub">{op.category} · {formatDate(op.date)}</div>
                </div>
                <div className={`op-amt ${op.type === 'income' ? 'amt-income' : ''}`}>
                  {signedMoney(op.type === 'income' ? op.amount : -op.amount, op.currency || cur)}
                </div>
                <button
                  className="op-del"
                  type="button"
                  aria-label="Удалить"
                  onClick={() => deleteOperation(op.id)}
                >
                  <Icon name="trash" size={16} color="#6B7180" />
                </button>
              </li>
            ))}
          </ul>
        )}

      </div>

      <Link to="/add" className="fab" aria-label="Добавить операцию">
        <Icon name="plus" size={26} color="#0F1115" strokeWidth={2.6} />
      </Link>

      <BottomNav />
    </div>
  )
}
