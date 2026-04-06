import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const staticCredentials = {
  user: { email: 'user@gmail.com', password: 'user@12' },
  admin: { email: 'admin@gmail', password: 'admin@12' },
}

export const LoginPage = () => {
  const { loginAs } = useAuth()
  const { isDarkMode, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [portalRole, setPortalRole] = useState('user')
  const [email, setEmail] = useState(staticCredentials.user.email)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const from = location.state?.from?.pathname

  const handleRoleChange = (role) => {
    setPortalRole(role)
    setEmail(staticCredentials[role].email)
    setPassword('')
    setError('')
  }

  const onSubmit = (event) => {
    event.preventDefault()

    const expected = staticCredentials[portalRole]
    const isValid = email.trim().toLowerCase() === expected.email && password === expected.password

    if (!isValid) {
      setError(`Invalid credentials. Use ${expected.email} / ${expected.password}`)
      return
    }

    loginAs({ role: portalRole, email: expected.email })
    setError('')

    if (from && ['/transactions', '/reports'].includes(from)) {
      navigate(from, { replace: true })
      return
    }

    if (portalRole === 'admin') {
      navigate('/admin', { replace: true })
      return
    }

    navigate('/user', { replace: true })
  }

  return (
    <main className="grid min-h-screen place-items-center bg-linear-to-br from-[#e8ebf3] via-[#f6f8fc] to-[#ecf4f0] p-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <section className="w-full max-w-[380px] rounded-[14px] border border-[#e5e9f1] bg-[#f9fafc] px-5 py-6 text-center shadow-[0_16px_32px_rgba(19,38,76,0.08)] transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 sm:px-[30px] sm:py-7">
        <div className="mb-2 flex justify-end">
          <button
            onClick={toggleTheme}
            className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300"
          >
            {isDarkMode ? 'Light' : 'Dark'}
          </button>
        </div>
        <div
          className="mx-auto mb-2 grid h-[38px] w-[38px] place-items-center rounded-[10px] bg-[#11207c]"
          aria-hidden="true"
        >
          <span className="relative h-[10px] w-[18px] rounded-[4px] border-2 border-white">
            <span className="absolute right-[2px] top-[2px] h-[3px] w-[3px] rounded-full bg-white" />
          </span>
        </div>
        <h1 className="mt-2 text-3xl font-bold text-[#14217a] dark:text-slate-100 sm:text-[40px]">Editorial Suite</h1>
        <p className="mt-1 text-sm text-[#707785] dark:text-slate-400">The Precision Curator</p>

        <div className="mt-[22px] grid grid-cols-2 gap-1 rounded-full bg-[#e7eaf0] p-1 dark:bg-slate-800">
          <button
            type="button"
            className={`h-8 rounded-full text-[13px] font-bold ${
              portalRole === 'user'
                ? 'bg-white text-[#13217b] shadow-[0_2px_8px_rgba(30,53,102,0.14)]'
                : 'bg-transparent text-[#5c6474] dark:text-slate-400'
            }`}
            onClick={() => handleRoleChange('user')}
          >
            User Access
          </button>
          <button
            type="button"
            className={`h-8 rounded-full text-[13px] font-bold ${
              portalRole === 'admin'
                ? 'bg-white text-[#13217b] shadow-[0_2px_8px_rgba(30,53,102,0.14)]'
                : 'bg-transparent text-[#5c6474] dark:text-slate-400'
            }`}
            onClick={() => handleRoleChange('admin')}
          >
            Admin Portal
          </button>
        </div>

        <form className="mt-[22px] text-left" onSubmit={onSubmit}>
          <label
            htmlFor="email"
            className="text-xs font-bold uppercase tracking-[0.06em] text-[#5f6676] dark:text-slate-400"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 mb-[14px] h-11 w-full rounded-lg border-0 bg-[#dfe3e8] px-[14px] text-[15px] text-[#566074] outline-none dark:bg-slate-800 dark:text-slate-200"
          />

          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-xs font-bold uppercase tracking-[0.06em] text-[#5f6676] dark:text-slate-400"
            >
              Password
            </label>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={portalRole === 'admin' ? 'admin@12' : 'user@12'}
            className="mt-2 mb-[14px] h-11 w-full rounded-lg border-0 bg-[#dfe3e8] px-[14px] text-[15px] text-[#566074] outline-none dark:bg-slate-800 dark:text-slate-200"
          />

          {error && <p className="mb-2 text-xs text-rose-500">{error}</p>}

          <button
            type="submit"
            className="mt-2 h-[46px] w-full rounded-full border-0 bg-[#14217a] text-base font-bold text-white transition-all duration-300 hover:scale-[1.01] hover:bg-[#102280]"
          >
            Sign In
          </button>
        </form>
      </section>
    </main>
  )
}
