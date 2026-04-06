export const NotFoundPage = () => {
  return (
    <main className="grid min-h-screen place-items-center bg-linear-to-br from-[#e8ebf3] via-[#f6f8fc] to-[#ecf4f0] p-6 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <section className="w-full max-w-[380px] rounded-[14px] border border-[#e5e9f1] bg-[#f9fafc] px-[30px] py-7 text-center shadow-[0_16px_32px_rgba(19,38,76,0.08)] dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-2 text-3xl font-bold text-[#14217a] dark:text-slate-100">404</h2>
        <p className="text-[#5f6676] dark:text-slate-400">Page not found.</p>
      </section>
    </main>
  )
}
