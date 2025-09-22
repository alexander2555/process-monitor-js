async function loadProcesses() {
  try {
    const response = await fetch('/api/processes')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const processes = await response.json()

    const tbody = document.getElementById('process-list')

    tbody.innerHTML = ''

    processes.forEach((process) => {
      const row = tbody.insertRow()
      row.innerHTML = `
                        <td>${process.pid}</td>
                        <td>${process.user}</td>
                        <td>${process.cpu}</td>
                        <td>${process.memory}</td>
                        <td>${process.command.substring(0, 50)}...</td>
                    `
    })

    document.getElementById(
      'last-update'
    ).textContent = `Last update: ${new Date().toLocaleTimeString()}`
  } catch (err) {
    console.warn('Error loading processes:', err)
  }
}

setInterval(loadProcesses, 2500)

loadProcesses()
