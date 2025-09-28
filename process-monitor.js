/**
 * Monitor system processes
 *
 * @class ProcessMonitor
 */
const os = require('os')
const { spawn } = require('child_process')
const iconv = require('iconv-lite')
class ProcessMonitor {
  constructor() {
    this.lastCallTime = null

    this.processes = []
    this.processPlatform = os.platform()
    this.totalMem = os.totalmem() / 1000000000 // in KB
    // Choose the appropriate parsing method based on the platform
    this.parseProcesses =
      this.processPlatform === 'win32'
        ? this.parseWindowsProcesses
        : this.parseLinuxProcesses
  }

  // Get the list of processes using 'ps' command
  async getProcesses() {
    // Calculate interval in seconds between processes list updates
    const now = Date.now()
    this.interval = this.lastCallTime ? (now - this.lastCallTime) / 1000 : null
    this.lastCallTime = now

    return new Promise((resolve, reject) => {
      let output = Buffer.alloc(0)

      const ps =
        this.processPlatform === 'win32'
          ? spawn('tasklist', ['/v', '/nh', '/fo', 'csv'])
          : spawn('ps', ['aux', 'h'])
      // spawn('powershell.exe', ['Get-Process | Select-Object Name,Id,CPU,WS | ConvertTo-Json',])
      ps.stdout.on('data', (data) => {
        output = Buffer.concat([output, data]) //+= data.toString()
      })

      ps.on('close', (code) => {
        if (code !== 0) return reject(new Error('Command failed'))
        this.processes = this.parseProcesses(
          iconv.decode(output, 'cp866')
        ).sort((a, b) => parseFloat(b.cpu) - parseFloat(a.cpu))
        resolve(this.processes)
      })

      ps.on('error', reject)
    })
  }

  /**
   * Parse the output of 'ps aux' command
   *
   * @param {string} output - Raw output from 'ps aux'
   * @returns {Object[]} - Array of process objects
   */
  parseLinuxProcesses(output) {
    // Split output into string array and filter out empty lines
    const lines = output.split('\n').filter((line) => line.trim())

    return lines
      .map((line) => {
        const parts = line.trim().split(/\s+/)
        // If the line contains necessary fields, return process object
        // 'ps aux' output formal: | 1 USER | 2 PID | 3 %CPU | 4 %MEM | 5 VSZ | 6 RSS | 7 TTY | 8 STAT | 9 START | 10 TIME | 11 COMMAND |
        return parts.length >= 11
          ? {
              pid: parts[1],
              user: parts[0],
              cpu: parts[2],
              memory: parts[3],
              command: parts.slice(10).join(' '),
            }
          : null
      })
      .filter(Boolean)
  }

  /**
   * Parse the output of tasklist command
   *
   * @param {string} output - Raw output from Get-Process command
   * @returns {Object[]} - Array of process objects
   */
  parseWindowsProcesses(output) {
    // Parse CSV output
    const lines = output.trim().split('\n')

    const getPrevCpuUsageTime = (pid) =>
      this.processes.filter((p) => p.pid === pid)[0]?.cpuPrevTime || 0

    return lines
      .map((line) => {
        // Split CSV line into columns and remove surrounding quotes
        // 'tasklist' command output format: "Name","PID","Session","Session number","Memory","State","User","CPU Time"
        const cols = line.split('","').map((c) => c.replace(/^"|"$/g, ''))
        // If the line doesn't contain necessary fields, skip it
        if (cols.length < 8) return null
        const pid = parseInt(cols[1])
        // Parse cpu time format from '0:00:00' to seconds count
        const cpuTimeArr = cols[7].split(':')
        const cpuCurrUsageTime =
          +cpuTimeArr[0] * 3600 + +cpuTimeArr[1] * 60 + +cpuTimeArr[2]
        // Calculating CPU usage time per update procesees interval
        const cpuTimePerInterval = this.interval
          ? Math.floor(cpuCurrUsageTime - getPrevCpuUsageTime(pid)) /
            this.interval
          : 0
        // CPU Usage in %
        const cpu = +Math.min(
          cpuTimePerInterval * (100 / os.cpus().length),
          100
        ).toFixed(2)

        return {
          pid,
          cpu,
          cpuPrevTime: cpuCurrUsageTime, // Save current CPU usage time
          memory: +(parseInt(cols[4]) / this.totalMem).toFixed(2), // Mem Usage
          command: cols[0], // Process name
          user: cols[6].replace(/[^\x20-\x7Eа-яА-ЯёЁ\\]/g, ''), //iconv.decode(Buffer.from(cols[6]), 'cp850').normalize(), // User
        }
      })
      .filter(Boolean)
  }
}

module.exports = { ProcessMonitor }
