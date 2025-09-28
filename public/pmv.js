const UPDATE_INTERVAL = 1000
const DEBOUNCE_INTERVAL = UPDATE_INTERVAL / 2

import { Pagination } from './pagination.js'

const pagination = new Pagination()

const tbody = document.getElementById('process-list')
const totalInfo = document.getElementById('total-processes')
const errMessage = document.getElementById('error-message')
const searchInput = document.getElementById('search-input')
const refreshBtn = document.getElementById('refresh-btn')
const loader = document.getElementById('loader')
// Elements to hide when error occurs
const hideOnErrorElements = [
  ...document.getElementsByClassName('hide-on-error'),
]

const debounce = (fn, delay) => {
  let ti = null
  return function (...args) {
    clearTimeout(ti)
    ti = setTimeout(() => fn.apply(this, args), delay)
  }
}

const pageRender = (currentPageProcesses) => {
  tbody.innerHTML = ''
  currentPageProcesses.forEach((process) => {
    const row = tbody.insertRow()
    row.insertCell().textContent = process.pid
    row.insertCell().textContent = process.user || 'N/A'
    row.insertCell().textContent = process.cpu || '0'
    row.insertCell().textContent = process.memory
    row.insertCell().textContent = process.command.substring(0, 50)
  })
}

const setHideContentStatus = (isHide) => {
  if (isHide) hideOnErrorElements.forEach((el) => el.classList.add('hide'))
  else hideOnErrorElements.forEach((el) => el.classList.remove('hide'))
}

const setPendingStatus = (isPending) => {
  if (isPending) {
    loader.style.display = 'block'
    setHideContentStatus(true)
    return
  }
  setHideContentStatus(false)
  searchInput.focus()
  loader.style.display = 'none'
}

/**
 * Fetch and display the list of processes from the server
 */
async function loadProcesses(e) {
  if (e?.target) setPendingStatus(true)

  // Clear previous interval if exists before fetching new data
  if (loadProcessesInteval) {
    clearInterval(loadProcessesInteval)
    loadProcessesInteval = null
  }

  try {
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
    pagination.renderPagination(processes, pageRender)
    totalInfo.textContent = processes.length

    // Update time show
    document.getElementById(
      'last-update'
    ).textContent = `Last update: ${new Date().toLocaleTimeString()}`

    // Hide error message
    errMessage.style.display = 'none'
    // Hide loader & Show hiding elements
    setPendingStatus(false)

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

    setHideContentStatus(true)
  }
}

// const thead = document.getElementById('process-list-head')
// Set table header based on platform

// Refresh and filter controls listeners
refreshBtn.addEventListener('click', debounce(loadProcesses, DEBOUNCE_INTERVAL))
searchInput.addEventListener(
  'input',
  debounce(loadProcesses, DEBOUNCE_INTERVAL)
)

let loadProcessesInteval = null

loadProcesses()
