const express = require('express')
const cors = require('cors')
const { calculateChart } = require('./index')

const app = express()
app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

// POST /chart
// body: { date: 'YYYY-MM-DD', time: 'HH:MM', latitude?: number, longitude?: number }
app.post('/chart', async (req, res) => {
  try {
    const { date, time, latitude = 0, longitude = 0 } = req.body || {}
    if (!date || !time) {
      return res.status(400).json({ error: 'date and time are required' })
    }

    const chart = await calculateChart(date, time, latitude, longitude)
    res.json(chart)
  } catch (e) {
    res.status(500).json({ error: e?.message || String(e) })
  }
})

const port = process.env.PORT ? Number(process.env.PORT) : 8787
app.listen(port, () => {
  console.log(`human_design_api server listening on http://127.0.0.1:${port}`)
})

