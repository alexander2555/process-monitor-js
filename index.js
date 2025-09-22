import express from 'express'
import { ProcessMonitor } from './process-monitor.js'

import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const monitor = new ProcessMonitor()

app.use(express.static(path.join(__dirname, 'public')))

app.get('/api/processes', async (_, res) => {
  try {
    const processes = await monitor.getProcesses()
    res.json(processes)
  } catch (err) {
    res.status(500).json({ error: err })
  }
})

const PORT = 3000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
