import { useMemo, useState } from 'react'
import { AppShell } from '../components/AppShell'
import { useAppData } from '../context/AppDataContext'
import { useAuth } from '../context/AuthContext'

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
  }).format(value)

export const TransactionsPage = () => {
  const { state, dispatch } = useAppData()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('All Types')
  const [categoryFilter, setCategoryFilter] = useState('All Categories')
  const [page, setPage] = useState(1)
  const pageSize = 4

  const categories = useMemo(
    () => ['All Categories', ...new Set(state.transactions.map((item) => item.category))],
    [state.transactions],
  )

  const filteredRows = useMemo(() => {
    return state.transactions.filter((row) => {
      const matchesQuery =
        !query ||
        row.description.toLowerCase().includes(query.toLowerCase()) ||
        row.id.toLowerCase().includes(query.toLowerCase())
      const matchesType = typeFilter === 'All Types' || row.type === typeFilter
      const matchesCategory = categoryFilter === 'All Categories' || row.category === categoryFilter
      return matchesQuery && matchesType && matchesCategory
    })
  }, [state.transactions, query, typeFilter, categoryFilter])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * pageSize
  const pageRows = filteredRows.slice(startIndex, startIndex + pageSize)

  const handleDelete = (id) => {
    if (!isAdmin) return
    dispatch({ type: 'DELETE_TRANSACTION', payload: { id } })
  }

  const handleEdit = (row) => {
    if (!isAdmin) return
    const updatedDescription = window.prompt('Update description', row.description)
    if (!updatedDescription) {
      return
    }
    dispatch({
      type: 'UPDATE_TRANSACTION',
      payload: { id: row.id, updates: { description: updatedDescription } },
    })
  }

  const handleExport = () => {
    const header = ['id', 'date', 'description', 'category', 'type', 'amount']
    const lines = filteredRows.map((row) =>
      [row.id, row.date, row.description, row.category, row.type, row.amount].join(','),
    )
    const csv = [header.join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'transactions-export.csv'
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <AppShell
      title="Transaction History"
      subtitle="Review and manage your enterprise fiscal movements."
      actionLabel="Export CSV"
      action={handleExport}
      searchPlaceholder="Search transactions..."
    >
      <section className="rounded-xl bg-white p-4 shadow-sm transition-all duration-300 dark:bg-slate-900 md:p-5">
        <div className="mb-3 h-1.5 w-32 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-[#2d3d63]" />
        </div>
        <div className="mb-3 flex justify-end">
          {!isAdmin && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Viewer mode: add/edit/delete disabled
            </span>
          )}
        </div>
        <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Search Database
            </label>
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(1)
              }}
              placeholder="Description, vendor, or transaction ID..."
              className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Type</label>
            <select
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value)
                setPage(1)
              }}
              className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-800"
            >
              <option>All Types</option>
              <option>Income</option>
              <option>Expense</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value)
                setPage(1)
              }}
              className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-800"
            >
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    No transactions found for current filters.
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{row.date}</td>
                    <td className="px-4 py-3 font-medium text-[#1e2f59] dark:text-slate-100">{row.description}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500 dark:bg-slate-800">
                        {row.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold ${
                          row.type === 'Income' ? 'text-emerald-600' : 'text-rose-500'
                        }`}
                      >
                        {row.type}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 font-semibold ${
                        row.amount >= 0 ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {formatCurrency(row.amount)}
                    </td>
                    <td className="px-4 py-3">
                      {isAdmin ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(row)}
                            className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(row.id)}
                            className="rounded border border-rose-200 px-2 py-1 text-xs text-rose-500"
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">View only</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>
            Showing {filteredRows.length === 0 ? 0 : startIndex + 1}-
            {Math.min(startIndex + pageSize, filteredRows.length)} of {filteredRows.length} transactions
          </p>
          <div className="flex gap-2">
            <button
              className="rounded border border-slate-200 px-3 py-1 disabled:opacity-50 dark:border-slate-700"
              disabled={currentPage === 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </button>
            <button
              className="rounded border border-slate-200 px-3 py-1 disabled:opacity-50 dark:border-slate-700"
              disabled={currentPage === totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </AppShell>
  )
}
