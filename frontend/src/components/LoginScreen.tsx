interface LoginScreenProps {
  onLogin: () => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-dark/95 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-card-border rounded-2xl p-8 md:p-10 w-full max-w-sm mx-4 shadow-2xl">
        <div className="flex flex-col items-center gap-5">
          {/* Logo */}
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg width="36" height="36" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>

          <div className="text-center">
            <h2 className="text-xl font-bold text-text-main">Study Mate AI</h2>
            <p className="text-sm text-text-muted mt-1">ව්‍යාපාර අධ්‍යයන පුහුණු සහායක</p>
          </div>

          <button
            onClick={onLogin}
            className="w-full bg-primary text-white border-none py-3 rounded-xl font-semibold text-base cursor-pointer hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Login as Guest
          </button>

          <p className="text-[10px] text-text-muted text-center">
            COM738 Dissertation Artifact · Wrexham University
          </p>
        </div>
      </div>
    </div>
  )
}
