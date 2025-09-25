import { Pagination } from './pagination.js'

const UPDATE_INTERVAL = 2500
const pagination = new Pagination()

/**
 * Fetch and display the list of processes from the server
 * @returns {Promise<void>}
 *
 */
async function loadProcesses() {
  const tbody = document.getElementById('process-list')
  const totalInfo = document.getElementById('total-processes')
  const errMessage = document.getElementById('error-message')
  const searchInput = document.getElementById('search-input')
  // Elements to hide when error occurs
  const hideOnErrorElements = [
    ...document.getElementsByClassName('hide-on-error'),
  ]

  try {
    // Clear previous interval if exists before fetching new data
    if (loadProcessesInteval) {
      clearInterval(loadProcessesInteval)
      loadProcessesInteval = null
    }

    // Fetch processes from server
    const response = await fetch('/api/processes')
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    let processes = await response.json()

    // !
    // Mock data without server
    //
    // let processes = []
    // for (let i = 0; i < 100; i++) {
    //   processes.push({
    //     pid: i,
    //     user: `user${i % 10}`,
    //     cpu: (Math.random() * 100).toFixed(1) + '%',
    //     memory: (Math.random() * 100).toFixed(1) + '%',
    //     command: `command_${i} --option value`,
    //   })
    // }
    // !

    // Filter processes based on search input
    const filterPhrase = searchInput.value.trim().toLowerCase()
    if (filterPhrase) {
      processes = processes.filter((p) =>
        p.command.toLowerCase().includes(filterPhrase)
      )
    }

    // Output processes table with pagination
    pagination.renderPagination(processes, (currentPageProcesses) => {
      tbody.innerHTML = ''
      currentPageProcesses.forEach((process) => {
        const row = tbody.insertRow()
        row.insertCell().textContent = process.pid
        row.insertCell().textContent = process.user
        row.insertCell().textContent = process.cpu
        row.insertCell().textContent = process.memory
        row.insertCell().textContent = process.command.substring(0, 50)
      })
    })
    totalInfo.textContent = processes.length

    // Update time show
    document.getElementById(
      'last-update'
    ).textContent = `Last update: ${new Date().toLocaleTimeString()}`

    // Hide error message
    errMessage.style.display = 'none'

    // If fetch was successful, setting interval to auto-refresh processes
    if (!loadProcessesInteval)
      loadProcessesInteval = setInterval(loadProcesses, UPDATE_INTERVAL)
  } catch (err) {
    tbody.innerHTML = ''

    // Error message show and log
    console.warn(err)
    errMessage.innerHTML =
      'Loading processes error! <br> Please <b>Refresh</b> later.'
    errMessage.style.display = 'block'

    hideOnErrorElements.forEach((el) => {
      el.style.display = 'none'
    })
  }
}

// Refresh and filter controls listeners
const refreshBtn = document.getElementById('refresh-btn')
refreshBtn.addEventListener('click', loadProcesses)
const searchInput = document.getElementById('search-input')
searchInput.addEventListener('input', loadProcesses)

let loadProcessesInteval = null

loadProcesses()
