import { Route, Routes } from 'react-router-dom'
import { AppDataProvider } from './context/AppDataContext'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { AdminPage } from './pages/AdminPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ReportsPage } from './pages/ReportsPage'
import { TransactionsPage } from './pages/TransactionsPage'
import { UnauthorizedPage } from './pages/UnauthorizedPage'
import { UserPage } from './pages/UserPage'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { RootRedirect } from './routes/RootRedirect'
import { UnauthOnlyRoute } from './routes/UnauthOnlyRoute'

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppDataProvider>
          <Routes>
            <Route path="/" element={<RootRedirect />} />

            <Route element={<UnauthOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['user']} />}>
              <Route path="/user" element={<UserPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>

            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AppDataProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
