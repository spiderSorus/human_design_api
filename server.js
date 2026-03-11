const express = require('express')
const cors = require('cors')
const { fetchZenChart } = require('./src/hd/zenfemme')
const { zenToFlatChart } = require('./src/hd/zenflat')

const app = express()
app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

// POST /chart
// body: {
//   localDate: 'YYYY-MM-DD',
//   localTime: 'HH:MM',
//   timezone: 'America/Los_Angeles',
//   latitude?: number,
//   longitude?: number,
//   name?: string,
//   birthplace?: string
// }
app.post('/chart', async (req, res) => {
  try {
    const {
      localDate,
      localTime,
      timezone,
      latitude = 0,
      longitude = 0,
      name,
      birthplace
    } = req.body || {}

    if (!localDate || !localTime || !timezone) {
      return res.status(400).json({ error: 'localDate, localTime, and timezone are required' })
    }

    // For safety, do not hardcode tokens in-repo.
    // Provide token via env: export ZENFEMME_TOKEN="..."
    const token = process.env.ZENFEMME_TOKEN
    if (!token) {
      return res.status(400).json({ error: 'Please set ZENFEMME_TOKEN env var' })
    }

    const sample = {
      name: name || 'Unknown',
      localDate,
      localTime,
      timezone,
      birthplace: birthplace || '',
      latitude,
      longitude
    }

    const zenFull = await fetchZenChart(sample, { token })
    const chart = zenToFlatChart({ sample, zenFull })
    res.json(chart)
  } catch (e) {
    res.status(500).json({ error: e?.message || String(e) })
  }
})

const port = process.env.PORT ? Number(process.env.PORT) : 8787
app.listen(port, () => {
  console.log(`human_design_api server listening on http://127.0.0.1:${port}`)
})
