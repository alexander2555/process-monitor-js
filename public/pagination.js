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

  setCurrentPageData() {
    const start = (this.currentPage - 1) * this.rowsPerPage
    const end = start + this.rowsPerPage
    this.currentPageData = this.data.slice(start, end)
  }

  set Data(data = []) {
    this.data = data
    this.totalPages = Math.ceil(data.length / this.rowsPerPage)
    this.setCurrentPageData()
  }

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

  renderPagination(data, onPageChange) {
    this.Data = data
    this.paginationContainer.style.display = 'none'
    this.paginationContainer.innerHTML = ''
    onPageChange(this.currentPageData)
    if (this.totalPages <= 1) return
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
