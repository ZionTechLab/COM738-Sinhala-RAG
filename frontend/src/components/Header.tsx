export function Header() {
  return (
    <header className="bg-card border-b border-card-border px-4 md:px-8 py-3 md:py-4 flex justify-between items-center gap-3">
      {/* Left: badge + title */}
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <span className="bg-gradient-to-r from-emerald-600 to-sky-600 text-white text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1 rounded-full font-semibold tracking-wide uppercase shrink-0">
          MSc
        </span>
        <div className="min-w-0">
          <div className="text-sm md:text-xl font-bold text-text-main truncate">
            StudyMate AI
          </div>
          <div className="text-[10px] md:text-sm text-text-muted truncate">
            O/L Business Studies · COM738
          </div>
        </div>
      </div>

      {/* Right: student info */}
      <div className="hidden sm:block text-right shrink-0">
        <div className="text-xs md:text-sm font-semibold">M.A.A.T. Perera (S25021960)</div>
        <div className="text-[10px] md:text-xs text-text-muted">Wrexham / Londontec</div>
      </div>
    </header>
  )
}
