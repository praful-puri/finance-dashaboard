import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  RadialLinearScale,
  Tooltip,
} from "chart.js";
import { useState } from "react";
import { Bar, PolarArea } from "react-chartjs-2";
import { AppShell } from "./AppShell";
import { useAppData } from "../context/AppDataContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
);

const spendingPalette = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export const FinanceDashboard = ({ role }) => {
  const { state } = useAppData();
  const [selectedCard, setSelectedCard] = useState("Total Balance");
  const recentTransactions = state.transactions.slice(0, 3);

  const expenseByCategory = state.transactions
    .filter((transaction) => transaction.amount < 0)
    .reduce((acc, transaction) => {
      const key = transaction.category || "Other";
      acc[key] = (acc[key] || 0) + Math.abs(transaction.amount);
      return acc;
    }, {});

  const sortedCategories = Object.entries(expenseByCategory).sort(
    (a, b) => b[1] - a[1],
  );
  const topSpendingCategory = sortedCategories[0] ?? ["N/A", 0];
  const spendingData = sortedCategories
    .slice(0, 5)
    .map(([name, amount], index) => ({
      name,
      amount: formatCurrency(amount),
      color: spendingPalette[index % spendingPalette.length],
    }));

  const metricCards = [
    {
      title: "Total Balance",
      value: formatCurrency(state.summary.totalBalance),
      note: "Live from reducer state",
      trend: "+2.4%",
      trendColor: "text-emerald-500",
    },
    {
      title: "Monthly Income",
      value: formatCurrency(state.summary.monthlyIncome),
      note: "Computed from transactions",
      trend: "INCOME",
      trendColor: "text-slate-500",
    },
    {
      title: "Monthly Expense",
      value: formatCurrency(state.summary.monthlyExpenses),
      note: "Computed from transactions",
      trend: "-12%",
      trendColor: "text-rose-500",
    },
    {
      title: "Net Savings",
      value: formatCurrency(state.summary.netSavings),
      note: "Income - Expenses",
      trend: "LIVE",
      trendColor: "text-slate-400",
    },
  ];

  const balanceTrendData = {
    labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
    datasets: [
      {
        label: "Balance",
        data: [35000, 42000, 51000, 65000, 74000, state.summary.totalBalance],
        backgroundColor: [
          "#1d4ed8",
          "#2563eb",
          "#3b82f6",
          "#06b6d4",
          "#14b8a6",
          "#10b981",
        ],
        borderRadius: 8,
      },
    ],
  };

  const spendingChartData = {
    labels: sortedCategories.map(([label]) => label).slice(0, 5),
    datasets: [
      {
        label: "Spending",
        data: sortedCategories.map(([, value]) => value).slice(0, 5),
        backgroundColor: spendingPalette,
      },
    ],
  };

  const savingRate = state.summary.monthlyIncome
    ? ((state.summary.netSavings / state.summary.monthlyIncome) * 100).toFixed(
        1,
      )
    : "0.0";

  return (
    <AppShell
      title="Financial Overview"
      subtitle="Status as of April 05, 2026"
      actionLabel={`Manage Accounts (${role})`}
      searchPlaceholder="Search data..."
    >
      <section className="rounded-xl bg-white p-4 shadow-sm transition-all duration-300 dark:bg-slate-900 md:p-5">
        <div className="mb-3 h-1.5 w-32 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-[#2d3d63]" />
        </div>
        <div className="grid gap-3 lg:grid-cols-4">
          {metricCards.map((card) => (
            <article
              key={card.title}
              onClick={() => setSelectedCard(card.title)}
              className={`cursor-pointer rounded-xl border border-slate-100 bg-slate-50 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-800 ${
                selectedCard === card.title ? "ring-2 ring-[#7697f8]" : ""
              }`}
            >
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                <span>{card.title}</span>
                <span className={card.trendColor}>{card.trend}</span>
              </div>
              <p className="mt-3 text-3xl font-semibold text-[#17264d] dark:text-slate-100">
                {card.value}
              </p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {card.note}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.75fr_1fr]">
        <article className="rounded-xl bg-white p-4 shadow-sm transition-all duration-300 dark:bg-slate-900 md:p-5">
          <div className="mb-3 h-1.5 w-32 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-[#2d3d63]" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#1e2e58] dark:text-slate-100">
                Balance Trend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bar chart over last 6 months
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800">
            <Bar
              data={balanceTrendData}
              options={{ responsive: true, maintainAspectRatio: false }}
              height={220}
            />
          </div>
        </article>

        <article className="rounded-xl bg-white p-4 shadow-sm transition-all duration-300 dark:bg-slate-900 md:p-5">
          <div className="mb-3 h-1.5 w-32 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-[#2d3d63]" />
          </div>
          <h3 className="text-lg font-semibold text-[#1e2e58] dark:text-slate-100">
            Spending Category
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Polar area distribution
          </p>
          <div className="mx-auto mt-4 max-w-[260px]">
            <PolarArea
              data={spendingChartData}
              options={{ responsive: true }}
            />
          </div>
          <ul className="mt-4 space-y-2">
            {spendingData.map((item) => (
              <li
                key={item.name}
                className="flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.name}
                </span>
                <span className="font-semibold text-[#1d2f63] dark:text-sky-300">
                  {item.amount}
                </span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm transition-all duration-300 dark:bg-slate-900 md:p-5">
        <div className="mb-3 h-1.5 w-32 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-[#2d3d63]" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#1e2e58] dark:text-slate-100">
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Last activity across all accounts
            </p>
          </div>
          <button className="text-xs font-medium text-[#2c4278] dark:text-sky-300">
            View All
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {recentTransactions.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-200 px-3 py-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              No recent transactions to display.
            </div>
          ) : (
            recentTransactions.map((tx) => (
              <div
                key={`${tx.id}-${tx.date}`}
                className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-3 py-2 transition-all duration-300 dark:border-slate-800 dark:bg-slate-800"
              >
                <div>
                  <p className="text-sm font-medium text-[#1f2f59] dark:text-slate-100">
                    {tx.description}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {tx.date}
                  </p>
                </div>
                <p
                  className={`text-sm font-semibold ${tx.amount >= 0 ? "text-emerald-600" : "text-rose-500"}`}
                >
                  {formatCurrency(tx.amount)}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </AppShell>
  );
};
