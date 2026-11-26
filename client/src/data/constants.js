export const currencies = [
  { code: 'ILS', symbol: '₪', name: 'Шекель' },
  { code: 'USD', symbol: '$', name: 'Доллар' },
  { code: 'EUR', symbol: '€', name: 'Евро' },
  { code: 'UAH', symbol: '₴', name: 'Гривна' },
  { code: 'GBP', symbol: '£', name: 'Фунт' },
  { code: 'RUB', symbol: '₽', name: 'Рубль' },
  { code: 'PLN', symbol: 'zł', name: 'Злотый' },
  { code: 'TRY', symbol: '₺', name: 'Лира' },
  { code: 'GEL', symbol: '₾', name: 'Лари' }
]

export const categories = [
  { name: 'Еда', icon: 'cart' },
  { name: 'Транспорт', icon: 'bus' },
  { name: 'Жильё', icon: 'house' },
  { name: 'Развлечения', icon: 'star' },
  { name: 'Здоровье', icon: 'heart' },
  { name: 'Прочее', icon: 'tag' }
]

export function symbolOf(code) {
  const found = currencies.find((c) => c.code === code)
  return found ? found.symbol : currencies[0].symbol
}

export function iconOf(categoryName) {
  const found = categories.find((c) => c.name === categoryName)
  return found ? found.icon : 'tag'
}

const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

export function formatDate(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getDate()} ${months[d.getMonth()]}`
}

export function money(value, code) {
  const neg = value < 0 ? '−' : ''
  return `${neg}${symbolOf(code)} ${Math.abs(value).toLocaleString('ru-RU')}`
}

export function signedMoney(value, code) {
  const sign = value > 0 ? '+' : value < 0 ? '−' : ''
  return `${sign}${symbolOf(code)} ${Math.abs(value).toLocaleString('ru-RU')}`
}
