import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import { prisma } from './db.js'
import { signToken, authRequired } from './auth.js'

const app = express()
const PORT = 4000

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password || password.length < 6) {
    return res.status(400).json({ error: 'Email и пароль обязательны, пароль от 6 символов' })
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ error: 'Такой email уже зарегистрирован' })
    }

    const hash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { email, password: hash } })
    const token = signToken(user.id)
    res.status(201).json({ token, email: user.email })
  } catch (error) {
    console.error('Ошибка регистрации:', error.message)
    res.status(500).json({ error: 'Не удалось зарегистрировать' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Введите email и пароль' })
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' })
    }

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) {
      return res.status(401).json({ error: 'Неверный email или пароль' })
    }

    const token = signToken(user.id)
    res.json({ token, email: user.email })
  } catch (error) {
    console.error('Ошибка входа:', error.message)
    res.status(500).json({ error: 'Не удалось войти' })
  }
})

app.get('/api/operations', authRequired, async (req, res) => {
  try {
    const operations = await prisma.operation.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    })
    res.json(operations)
  } catch (error) {
    console.error('Ошибка при чтении операций:', error.message)
    res.status(500).json({ error: 'Нет связи с базой данных' })
  }
})

app.post('/api/operations', authRequired, async (req, res) => {
  const { amount, type, category, note, date, currency } = req.body

  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Сумма должна быть числом больше нуля' })
  }
  if (type !== 'income' && type !== 'expense') {
    return res.status(400).json({ error: 'Тип должен быть income или expense' })
  }

  try {
    const operation = await prisma.operation.create({
      data: {
        amount,
        type,
        category: category ?? 'Прочее',
        note: note ?? null,
        date: date ?? new Date().toISOString().slice(0, 10),
        currency: currency ?? 'ILS',
        userId: req.userId
      }
    })
    res.status(201).json(operation)
  } catch (error) {
    console.error('Ошибка при создании операции:', error.message)
    res.status(500).json({ error: 'Нет связи с базой данных' })
  }
})

app.delete('/api/operations/:id', authRequired, async (req, res) => {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Неверный id' })
  }

  try {
    await prisma.operation.deleteMany({ where: { id, userId: req.userId } })
    res.json({ ok: true })
  } catch (error) {
    console.error('Ошибка при удалении операции:', error.message)
    res.status(500).json({ error: 'Не удалось удалить операцию' })
  }
})

app.get('/api/scenarios', authRequired, async (req, res) => {
  try {
    const scenarios = await prisma.scenario.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'asc' }
    })
    res.json(scenarios)
  } catch (error) {
    console.error('Ошибка при чтении развилок:', error.message)
    res.status(500).json({ error: 'Нет связи с базой данных' })
  }
})

app.post('/api/scenarios', authRequired, async (req, res) => {
  const { title, amount, type, date } = req.body

  if (!title || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Нужны название и сумма больше нуля' })
  }
  if (type !== 'income' && type !== 'expense') {
    return res.status(400).json({ error: 'Тип должен быть income или expense' })
  }

  try {
    const scenario = await prisma.scenario.create({
      data: { title, amount, type, date: date || null, userId: req.userId }
    })
    res.status(201).json(scenario)
  } catch (error) {
    console.error('Ошибка при создании развилки:', error.message)
    res.status(500).json({ error: 'Нет связи с базой данных' })
  }
})

app.patch('/api/scenarios/:id', authRequired, async (req, res) => {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Неверный id' })
  }

  try {
    await prisma.scenario.updateMany({
      where: { id, userId: req.userId },
      data: { active: Boolean(req.body.active) }
    })
    res.json({ ok: true })
  } catch (error) {
    console.error('Ошибка при обновлении развилки:', error.message)
    res.status(500).json({ error: 'Не удалось обновить развилку' })
  }
})

app.delete('/api/scenarios/:id', authRequired, async (req, res) => {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Неверный id' })
  }

  try {
    await prisma.scenario.deleteMany({ where: { id, userId: req.userId } })
    res.json({ ok: true })
  } catch (error) {
    console.error('Ошибка при удалении развилки:', error.message)
    res.status(500).json({ error: 'Не удалось удалить развилку' })
  }
})

app.get('/api/pairs', authRequired, async (req, res) => {
  try {
    const pairs = await prisma.ratePair.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'asc' }
    })
    res.json(pairs)
  } catch (error) {
    console.error('Ошибка при чтении пар:', error.message)
    res.status(500).json({ error: 'Нет связи с базой данных' })
  }
})

app.post('/api/pairs', authRequired, async (req, res) => {
  const { fromCode, toCode } = req.body
  if (!fromCode || !toCode) {
    return res.status(400).json({ error: 'Нужны обе валюты' })
  }

  try {
    const pair = await prisma.ratePair.create({
      data: { fromCode, toCode, userId: req.userId }
    })
    res.status(201).json(pair)
  } catch (error) {
    console.error('Ошибка при создании пары:', error.message)
    res.status(500).json({ error: 'Нет связи с базой данных' })
  }
})

app.patch('/api/pairs/:id', authRequired, async (req, res) => {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Неверный id' })
  }

  try {
    await prisma.ratePair.updateMany({
      where: { id, userId: req.userId },
      data: { fromCode: req.body.fromCode, toCode: req.body.toCode }
    })
    res.json({ ok: true })
  } catch (error) {
    console.error('Ошибка при обновлении пары:', error.message)
    res.status(500).json({ error: 'Не удалось обновить пару' })
  }
})

app.delete('/api/pairs/:id', authRequired, async (req, res) => {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Неверный id' })
  }

  try {
    await prisma.ratePair.deleteMany({ where: { id, userId: req.userId } })
    res.json({ ok: true })
  } catch (error) {
    console.error('Ошибка при удалении пары:', error.message)
    res.status(500).json({ error: 'Не удалось удалить пару' })
  }
})

app.get('/api/rates', async (req, res) => {
  const base = (req.query.base || 'USD').toUpperCase()

  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/${base}`)
    const data = await response.json()
    if (data.result !== 'success') {
      throw new Error('bad response')
    }
    res.json({ base, updated: data.time_last_update_utc, rates: data.rates })
  } catch (error) {
    console.error('Ошибка при получении курсов:', error.message)
    res.status(502).json({ error: 'Не удалось получить курсы валют' })
  }
})

app.listen(PORT, () => {
  console.log(`Сервер работает: http://localhost:${PORT}`)
})
