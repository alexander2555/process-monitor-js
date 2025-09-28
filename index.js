const express = require('express')
const path = require('path')
const { ProcessMonitor } = require('./process-monitor.js')

const app = express()
const monitor = new ProcessMonitor()

app.use(
  express.static(
    process.pkg
      ? path.join(path.dirname(process.execPath), 'public')
      : path.join(__dirname, 'public')
  )
)

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
