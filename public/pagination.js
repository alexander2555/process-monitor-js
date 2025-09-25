/**
 * Pagination class to handle data pagination and rendering
 *
 * @class Pagination
 * @param {Object[]} data - Array of data objects to paginate
 * @param {number} rowsPerPage - Number of data rows per page
 * @param {string} paginationContainerId - ID of the container element for controls
 */
export class Pagination {
  constructor(
    data = [],
    rowsPerPage = 10,
    paginationContainerId = 'pagination-controls'
  ) {
    this.paginationContainer = document.getElementById(paginationContainerId)
    this.currentPage = 1
    this.totalPages = 1
    this.rowsPerPage = rowsPerPage
    this.Data = data
  }

  // Set current page data based on current page and data rows
  setCurrentPageData() {
    const start = (this.currentPage - 1) * this.rowsPerPage
    const end = start + this.rowsPerPage
    this.currentPageData = this.data.slice(start, end)
  }

  // Set data to paginate and reset current page data rows
  set Data(data = []) {
    this.data = data
    this.totalPages = Math.ceil(data.length / this.rowsPerPage)
    this.setCurrentPageData()
  }

  // Set current page and update current page data rows
  set Page(page) {
    if (page < 1) page = 1
    if (page > this.totalPages) page = this.totalPages
    this.currentPage = page
    const btn = document.getElementById(`paginationBtn${page}`)
    const buttons = [...this.paginationContainer.getElementsByTagName('button')]
    if (buttons.length) buttons.forEach((b) => (b.disabled = false))
    if (btn) btn.disabled = true
    this.setCurrentPageData()
  }

  /**
   * Render pagination controls and data
   * @param {string[]} data - to paginate
   * @param {function(string[])}} onPageChange - Callback function on page change that receives current page data
   * @returns void
   */
  renderPagination(data, onPageChange) {
    this.Data = data
    this.paginationContainer.style.display = 'none'
    this.paginationContainer.innerHTML = ''
    // Initial call to render first page data
    onPageChange(this.currentPageData)
    // No need to render pagination controls if only one page
    if (this.totalPages <= 1) return
    // Create pagination buttons
    for (let i = 1; i <= this.totalPages; i++) {
      const button = document.createElement('button')
      button.id = `paginationBtn${i}`
      button.textContent = i
      if (i === this.currentPage) button.disabled = true
      button.addEventListener('click', () => {
        this.Page = i
        onPageChange(this.currentPageData)
      })
      this.paginationContainer.appendChild(button)
    }
    this.paginationContainer.style.display = 'block'
  }
}
