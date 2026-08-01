interface HeaderProps {
  darkMode: boolean
  onToggleTheme: () => void
}

export function Header({ darkMode, onToggleTheme }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-card border-b border-card-border px-4 md:px-8 py-3 md:py-4 flex justify-between items-center gap-3">
      {/* Left: badge + title */}
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <span className="bg-gradient-to-r from-emerald-600 to-sky-600 text-white text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1 rounded-full font-semibold tracking-wide uppercase shrink-0">
          MSc
        </span>
        <div className="min-w-0">
          <div className="text-sm md:text-xl font-bold text-text-main truncate">
            Study Mate AI
          </div>
          <div className="text-[10px] md:text-sm text-text-muted truncate">
            O/L Business Studies · COM738
          </div>
        </div>
      </div>

      {/* Right: theme toggle + user icon */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-dark-light transition-colors"
          aria-label="Toggle theme"
        >
          {darkMode ? (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>

        {/* User icon — guest */}
        <div className="flex items-center gap-2 bg-dark-light border border-card-border rounded-lg px-3 py-1.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center text-white text-[10px] font-bold">
            G
          </div>
          <span className="text-xs text-text-muted hidden sm:inline">Guest</span>
        </div>
      </div>
    </header>
  )
}
