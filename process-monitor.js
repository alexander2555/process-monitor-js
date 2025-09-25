import { spawn } from 'child_process'

/**
 * Monitor system processes
 *
 * @class ProcessMonitor
 */
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

  /**
   * Parse the output of 'ps aux' command
   *
   * @param {string} output - Raw output from 'ps aux'
   * @returns {Object[]} - Sorted Array of process objects
   */
  parseProcesses(output) {
    // Split output into string array and filter out empty lines
    const lines = output.split('\n').filter((line) => line.trim())
    const processes = []

    for (let i = 1; i < lines.length; i++) {
      // Split line by whitespace
      const parts = lines[i].trim().split(/\s+/)
      /** Esure that string contains all the necessary fields to correctly assemble the process object
       * ps aux command output format:
       * | 1 USER | 2 PID | 3 %CPU | 4 %MEM | 5 VSZ | 6 RSS | 7 TTY | 8 STAT | 9 START | 10 TIME | 11 COMMAND |
       */
      if (parts.length >= 11) {
        processes.push({
          pid: parts[1],
          user: parts[0],
          cpu: parts[2],
          memory: parts[3],
          command: parts.slice(10).join(' '), // Get and join COMMAND parts with spaces
        })
      }
    }

    // Sort returning processes array by CPU usage
    return processes.sort((a, b) => parseFloat(b.cpu) - parseFloat(a.cpu))
  }
}
