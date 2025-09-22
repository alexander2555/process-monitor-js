import { spawn } from 'child_process'

export class ProcessMonitor {
  constructor() {
    this.processes = []
  }

  // Get the list of processes using 'ps' command
  async getProcesses() {
    return new Promise((resolve, reject) => {
      const ps = spawn('ps', ['aux'])
      let output = ''

      ps.stdout.on('data', (data) => {
        output += data.toString()
      })

      ps.on('close', () => {
        this.processes = this.parseProcesses(output)
        resolve(this.processes)
      })

      ps.on('error', reject)
    })
  }

  parseProcesses(output) {
    const lines = output.split('\n').filter((line) => line.trim())
    const processes = []

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].trim().split(/\s+/)
      if (parts.length >= 11) {
        processes.push({
          pid: parts[1],
          user: parts[0],
          cpu: parts[2],
          memory: parts[3],
          command: parts.slice(10).join(' '),
        })
      }
    }

    return processes.sort((a, b) => parseFloat(b.cpu) - parseFloat(a.cpu))
  }
}
