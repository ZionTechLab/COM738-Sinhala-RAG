export function Header() {
  return (
    <header className="bg-card border-b border-card-border px-8 py-4 flex justify-between items-center flex-wrap gap-4">
      <div className="flex items-center gap-3">
        <span className="bg-gradient-to-r from-emerald-600 to-sky-600 text-white text-xs px-3 py-1 rounded-full font-semibold tracking-wide uppercase">
          MSc Dissertation
        </span>
        <div>
          <div className="text-xl font-bold text-text-main">
            Sinhala Secondary Education RAG
          </div>
          <div className="text-sm text-text-muted">
            O/L Business Studies Grounded QA · COM738
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold">M.A.A.T. Perera (S25021960)</div>
        <div className="text-xs text-text-muted">Wrexham University / Londontec</div>
      </div>
    </header>
  )
}
