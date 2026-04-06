import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const initialForm = {
  date: "05-04-2026",
  name: "",
  amount: "0.00",
  type: "Expense",
  category: "",
  useCustomCategory: false,
  customCategory: "",
};

export const AppShell = ({
  title,
  subtitle,
  searchPlaceholder = "Search...",
  actionLabel,
  action,
  children,
}) => {
  const { user, logout } = useAuth();
  const { dispatch } = useAppData();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [form, setForm] = useState(initialForm);

  const isAdmin = user?.role === "admin";
  const dashboardPath = isAdmin ? "/admin" : "/user";
  const navItems = [
    { label: "Dashboard", to: dashboardPath },
    { label: "Transactions", to: "/transactions" },
    { label: "Reports", to: "/reports" },
  ];

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleAddTransaction = (event) => {
    event.preventDefault();

    const category = form.useCustomCategory
      ? form.customCategory.trim()
      : form.category;
    if (!form.name.trim() || !category) {
      return;
    }

    const parsedAmount = Number(form.amount);
    if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
      return;
    }

    const amount =
      form.type === "Expense"
        ? -Math.abs(parsedAmount)
        : Math.abs(parsedAmount);

    dispatch({
      type: "ADD_TRANSACTION",
      payload: {
        id: `TXN-${Math.floor(100 + Math.random() * 900)}`,
        date: form.date,
        description: form.name.trim(),
        amount,
        type: form.type,
        category,
      },
    });

    setForm(initialForm);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f3f5f8] text-[#1a2340] transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-20 bg-white/90 px-4 py-3 backdrop-blur md:px-6 dark:bg-slate-900/90 relative">
        <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between gap-3">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-semibold"> Financial</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="h-8 w-32 rounded-md border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-slate-300 md:w-56 dark:border-slate-700 dark:bg-slate-800"
            />
            {isAdmin && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="rounded-md bg-[#2d3d63] px-3 py-1.5 text-xs font-semibold text-white transition-all duration-300 hover:scale-[1.02]"
              >
                Add Transaction
              </button>
            )}
            <button
              onClick={toggleTheme}
              className="rounded-md border border-slate-200 px-2 py-1 text-xs dark:border-slate-700"
            >
              {isDarkMode ? "Light" : "Dark"}
            </button>
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="grid h-8 w-8 place-items-center rounded-full bg-[#27407f] text-xs font-bold text-white"
              >
                {user?.role?.slice(0, 1)?.toUpperCase()}
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 top-10 w-44 rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                  <p className="px-2 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {user?.name}
                  </p>
                  <p className="px-2 py-1 text-[11px] text-slate-400">
                    {user?.email}
                  </p>
                  <button
                    onClick={handleLogout}
                    className="mt-1 w-full rounded-md bg-slate-100 px-2 py-1.5 text-left text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-200/80 dark:bg-slate-800" />
      </header>

      <div className="mx-auto grid w-full max-w-[1320px] md:grid-cols-[220px_1fr]">
        <aside className="relative bg-white p-4 dark:bg-slate-900 md:min-h-[calc(100vh-57px)]">
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition-all duration-300 ${
                    isActive
                      ? "bg-[#dbe7ff] font-semibold text-[#1d2f63] dark:bg-slate-800 dark:text-sky-300"
                      : "text-slate-600 dark:text-slate-400"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="absolute bottom-0 right-0 top-0 w-px bg-slate-200/80 dark:bg-slate-800" />
        </aside>

        <main className="space-y-4 p-4 md:p-6">
          <section className="rounded-xl bg-white p-4 shadow-sm transition-all duration-300 dark:bg-slate-900 md:p-5">
            <div className="mb-3 h-1.5 w-32 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-[#2d3d63]" />
            </div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-[#1d2d56] dark:text-slate-100 md:text-4xl">
                  {title}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {subtitle}
                </p>
              </div>
              {actionLabel && (
                <button
                  onClick={action}
                  className="rounded-md bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  {actionLabel}
                </button>
              )}
            </div>
          </section>

          {children}
        </main>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg dark:bg-slate-900">
            <h3 className="text-xl font-semibold text-[#1d2d56] dark:text-slate-100">
              Add Transaction
            </h3>
            <form className="mt-4 space-y-3" onSubmit={handleAddTransaction}>
              <div>
                <label className="text-sm text-slate-500 dark:text-slate-400">
                  Date
                </label>
                <input
                  value={form.date}
                  onChange={(event) => handleChange("date", event.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="text-sm text-slate-500 dark:text-slate-400">
                  Name
                </label>
                <input
                  value={form.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  placeholder="Enter name"
                  className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="text-sm text-slate-500 dark:text-slate-400">
                  Amount (Rs)
                </label>
                <input
                  value={form.amount}
                  onChange={(event) =>
                    handleChange("amount", event.target.value)
                  }
                  type="number"
                  step="0.01"
                  min="0"
                  className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm text-slate-500 dark:text-slate-400">
                    Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(event) =>
                      handleChange("type", event.target.value)
                    }
                    className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option>Expense</option>
                    <option>Income</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-slate-500 dark:text-slate-400">
                    Category
                  </label>
                  {!form.useCustomCategory ? (
                    <select
                      value={form.category}
                      onChange={(event) =>
                        handleChange("category", event.target.value)
                      }
                      className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-800"
                    >
                      <option value="">Select category</option>
                      <option value="Software">Software</option>
                      <option value="Operations">Operations</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Payroll">Payroll</option>
                      <option value="Housing">Housing</option>
                      <option value="Investments">Investments</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <input
                      value={form.customCategory}
                      onChange={(event) =>
                        handleChange("customCategory", event.target.value)
                      }
                      placeholder="Custom category"
                      className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-800"
                    />
                  )}
                </div>
              </div>

              {isAdmin && (
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.useCustomCategory}
                    onChange={(event) =>
                      handleChange("useCustomCategory", event.target.checked)
                    }
                  />
                  Add custom category
                </label>
              )}

              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-[#2d3d63] px-3 py-2 text-sm font-medium text-white"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
