export const totals = {
  balance: 4250,
  income: 9500,
  expense: 5250
}

export const operations = [
  { id: 1, title: 'Зарплата', category: 'Доход', date: '15 ноя', amount: 9500, type: 'income', icon: 'wallet' },
  { id: 2, title: 'Аренда', category: 'Жильё', date: '10 ноя', amount: -3200, type: 'expense', icon: 'house' },
  { id: 3, title: 'Продукты', category: 'Еда', date: '9 ноя', amount: -420, type: 'expense', icon: 'cart' },
  { id: 4, title: 'Кафе', category: 'Еда', date: '8 ноя', amount: -95, type: 'expense', icon: 'coffee' },
  { id: 5, title: 'Транспорт', category: 'Проезд', date: '7 ноя', amount: -60, type: 'expense', icon: 'bus' }
]

export const categories = ['Еда', 'Транспорт', 'Жильё', 'Развлечения', 'Здоровье', 'Прочее']

export function formatMoney(value) {
  const sign = value > 0 ? '+' : value < 0 ? '−' : ''
  const abs = Math.abs(value).toLocaleString('ru-RU')
  return `${sign}₪ ${abs}`
}
