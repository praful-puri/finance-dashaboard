import { createContext, useContext, useMemo, useReducer } from 'react'

const BASE_BALANCE = 11000

const initialTransactions = [
  {
    id: 'TXN-101',
    date: 'Oct 24, 2023',
    description: 'AWS Cloud Services',
    category: 'Software',
    type: 'Expense',
    amount: -1240.0,
  },
  {
    id: 'TXN-102',
    date: 'Oct 22, 2023',
    description: 'Client Retainer - Acme Corp',
    category: 'Operations',
    type: 'Income',
    amount: 85000.0,
  },
  {
    id: 'TXN-103',
    date: 'Oct 20, 2023',
    description: 'Digital Marketing Q4 Bundle',
    category: 'Marketing',
    type: 'Expense',
    amount: -3100.45,
  },
  {
    id: 'TXN-104',
    date: 'Oct 19, 2023',
    description: 'Monthly Staff Payroll',
    category: 'Payroll',
    type: 'Expense',
    amount: -22907.55,
  },
  {
    id: 'TXN-105',
    date: 'Oct 16, 2023',
    description: 'Angel Investment Payout',
    category: 'Investments',
    type: 'Income',
    amount: 30000.0,
  },
  {
    id: 'TXN-106',
    date: 'Oct 13, 2023',
    description: 'Consulting Revenue',
    category: 'Operations',
    type: 'Income',
    amount: 12500.0,
  },
  {
    id: 'TXN-107',
    date: 'Oct 11, 2023',
    description: 'Office Lease',
    category: 'Housing',
    type: 'Expense',
    amount: -12500.0,
  },
]

const initialReports = [
  { id: 'RPT-301', name: 'Q3 Enterprise Financial Audit', format: 'PDF', size: '4.2 MB', date: 'Oct 24, 2023' },
  { id: 'RPT-302', name: 'September Operational Expense Ledger', format: 'CSV', size: '1.8 MB', date: 'Oct 02, 2023' },
  { id: 'RPT-303', name: 'FY2023 Strategic Revenue Projection', format: 'PDF', size: '12.5 MB', date: 'Sep 15, 2023' },
  { id: 'RPT-304', name: 'Marketing ROI Analysis - Q2', format: 'PDF', size: '3.1 MB', date: 'Aug 28, 2023' },
]

const calculateSummary = (transactions) => {
  const monthlyIncome = transactions
    .filter((transaction) => transaction.amount > 0)
    .reduce((total, transaction) => total + transaction.amount, 0)
  const monthlyExpenses = Math.abs(
    transactions
      .filter((transaction) => transaction.amount < 0)
      .reduce((total, transaction) => total + transaction.amount, 0),
  )
  const netSavings = monthlyIncome - monthlyExpenses
  const totalBalance = BASE_BALANCE + netSavings

  return {
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    netSavings,
  }
}

const initialState = {
  summary: {
    totalBalance: 88752,
    monthlyIncome: 127500,
    monthlyExpenses: 39748,
    netSavings: 77752,
  },
  transactions: initialTransactions,
  reports: initialReports,
}

const appDataReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TRANSACTION': {
      const transactions = [action.payload, ...state.transactions]
      return { ...state, transactions, summary: calculateSummary(transactions) }
    }
    case 'UPDATE_TRANSACTION': {
      const transactions = state.transactions.map((transaction) =>
        transaction.id === action.payload.id ? { ...transaction, ...action.payload.updates } : transaction,
      )
      return { ...state, transactions, summary: calculateSummary(transactions) }
    }
    case 'DELETE_TRANSACTION': {
      const transactions = state.transactions.filter((transaction) => transaction.id !== action.payload.id)
      return { ...state, transactions, summary: calculateSummary(transactions) }
    }
    case 'ADD_REPORT': {
      return { ...state, reports: [action.payload, ...state.reports] }
    }
    case 'UPDATE_REPORT': {
      return {
        ...state,
        reports: state.reports.map((report) =>
          report.id === action.payload.id ? { ...report, ...action.payload.updates } : report,
        ),
      }
    }
    case 'DELETE_REPORT': {
      return { ...state, reports: state.reports.filter((report) => report.id !== action.payload.id) }
    }
    case 'BULK_ADD_REPORTS': {
      return { ...state, reports: [...action.payload, ...state.reports] }
    }
    default:
      return state
  }
}

const AppDataContext = createContext(null)

export const AppDataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appDataReducer, initialState)

  const value = useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state],
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export const useAppData = () => {
  const context = useContext(AppDataContext)

  if (!context) {
    throw new Error('useAppData must be used inside AppDataProvider')
  }

  return context
}
