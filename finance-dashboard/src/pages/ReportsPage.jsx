import { useMemo } from "react";
import { AppShell } from "../components/AppShell";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";

const reportTemplates = [
  {
    id: "monthly",
    title: "Monthly",
    description:
      "Detailed breakdown of cash flow and operational expenses for the current period.",
  },
  {
    id: "quarterly",
    title: "Quarterly",
    description:
      "Strategic analysis of growth trends and departmental budget allocations.",
  },
  {
    id: "annual",
    title: "Annual",
    description:
      "Fiscal year comprehensive summary for stakeholder review and tax compliance.",
  },
  {
    id: "custom",
    title: "Custom",
    description:
      "Tailor parameters, timeframes, and specific ledger categories.",
  },
];

const formatToday = () =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date());

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export const ReportsPage = () => {
  const { state, dispatch } = useAppData();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const templateById = useMemo(
    () =>
      Object.fromEntries(
        reportTemplates.map((template) => [template.id, template]),
      ),
    [],
  );
  const insights = useMemo(() => {
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
    const [topCategory = "N/A", topCategorySpend = 0] =
      sortedCategories[0] || [];
    const savingRate = state.summary.monthlyIncome
      ? (
          (state.summary.netSavings / state.summary.monthlyIncome) *
          100
        ).toFixed(1)
      : "0.0";

    return {
      topCategory,
      topCategorySpend,
      savingRate,
    };
  }, [
    state.transactions,
    state.summary.monthlyIncome,
    state.summary.netSavings,
  ]);

  const generateSingle = (templateId) => {
    if (!isAdmin) return;
    const template = templateById[templateId];
    const newReport = {
      id: `RPT-${Math.floor(Math.random() * 900 + 100)}`,
      name: `${template.title} Financial Snapshot`,
      format: templateId === "custom" ? "CSV" : "PDF",
      size: templateId === "custom" ? "0.9 MB" : "2.4 MB",
      date: formatToday(),
    };
    dispatch({ type: "ADD_REPORT", payload: newReport });
  };

  const generateAll = () => {
    if (!isAdmin) return;
    const today = formatToday();
    const generated = reportTemplates.map((template, index) => ({
      id: `RPT-${700 + index}`,
      name: `${template.title} Auto Generated Report`,
      format: template.id === "custom" ? "CSV" : "PDF",
      size: template.id === "custom" ? "1.1 MB" : "2.8 MB",
      date: today,
    }));
    dispatch({ type: "BULK_ADD_REPORTS", payload: generated });
  };

  const deleteReport = (id) => {
    if (!isAdmin) return;
    dispatch({ type: "DELETE_REPORT", payload: { id } });
  };

  const renameReport = (report) => {
    if (!isAdmin) return;
    const updatedName = window.prompt("Rename report", report.name);
    if (!updatedName) {
      return;
    }
    dispatch({
      type: "UPDATE_REPORT",
      payload: { id: report.id, updates: { name: updatedName } },
    });
  };

  const downloadReport = (report) => {
    const content = `${report.name}\n${report.format} - ${report.size}\nGenerated: ${report.date}\n`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${report.name.replace(/\s+/g, "-").toLowerCase()}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <AppShell
      title="Portfolio Insights"
      subtitle="Architectural overview of your fiscal performance and projections."
      actionLabel={isAdmin ? "Generate All" : "Viewer Mode"}
      action={isAdmin ? generateAll : undefined}
      searchPlaceholder="Search reports..."
    >
      <section className="grid gap-3 md:grid-cols-3">
        <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Highest Spending Category
          </p>
          <p className="mt-2 text-lg font-semibold text-[#1d2f58] dark:text-slate-100">
            {insights.topCategory}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {formatCurrency(insights.topCategorySpend)}
          </p>
        </article>

        <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Monthly Comparison
          </p>
          <p className="mt-2 text-lg font-semibold text-[#1d2f58] dark:text-slate-100">
            {formatCurrency(state.summary.monthlyIncome)} vs{" "}
            {formatCurrency(state.summary.monthlyExpenses)}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Income vs expense this month
          </p>
        </article>

        <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Observation
          </p>
          <p className="mt-2 text-lg font-semibold text-[#1d2f58] dark:text-slate-100">
            Savings Rate {insights.savingRate}%
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {state.summary.netSavings >= 0
              ? "Positive monthly cash flow. Keep this pace."
              : "Expenses exceed income. Consider cost controls."}
          </p>
        </article>
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm transition-all duration-300 dark:bg-slate-900 md:p-5">
        <div className="mb-3 h-1.5 w-32 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-[#2d3d63]" />
        </div>
        <div className="mb-4 hidden grid-cols-[1fr_160px_220px] gap-4 text-xs font-semibold uppercase tracking-wide text-slate-400 md:grid">
          <h3 className="text-lg normal-case tracking-normal text-[#1e2f5b] dark:text-slate-100">
            Recent Reports
          </h3>
          <span className="self-end">Date Generated</span>
          <span className="self-end">Actions</span>
        </div>
        <h3 className="mb-4 text-lg text-[#1e2f5b] dark:text-slate-100 md:hidden">
          Recent Reports
        </h3>

        <div className="space-y-2">
          {state.reports.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-200 px-3 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              No reports available.{" "}
              {isAdmin
                ? "Generate one to get started."
                : "Ask admin to generate reports."}
            </div>
          ) : (
            state.reports.map((report) => (
              <div
                key={report.id}
                className="grid gap-3 rounded-md border border-slate-100 bg-slate-50 px-3 py-3 md:grid-cols-[1fr_160px_220px] md:items-center dark:border-slate-800 dark:bg-slate-800"
              >
                <div>
                  <p className="font-semibold text-[#1f2f59] dark:text-slate-100">
                    {report.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {report.format} - {report.size}
                  </p>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {report.date}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300"
                    onClick={() => downloadReport(report)}
                  >
                    Download
                  </button>
                  {isAdmin ? (
                    <>
                      <button
                        className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300"
                        onClick={() => renameReport(report)}
                      >
                        Rename
                      </button>
                      <button
                        className="rounded border border-rose-200 px-2 py-1 text-xs text-rose-500"
                        onClick={() => deleteReport(report.id)}
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <span className="self-center text-xs text-slate-400">
                      View only
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </AppShell>
  );
};
