interface HamburgerMenuProps {
  open: boolean
  onClose: () => void
  onOpenAbout: () => void
}

export function HamburgerMenu({ open, onClose, onOpenAbout }: HamburgerMenuProps) {
  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[55] bg-black/40" onClick={onClose} />

      {/* Menu panel */}
      <div className="fixed top-0 left-0 z-[56] h-full w-64 bg-card border-r border-card-border shadow-2xl animate-fade-in">
        <div className="p-4 border-b border-card-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-sky-600 flex items-center justify-center">
              <svg width="15" height="15" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              </svg>
            </div>
            <span className="text-sm font-bold text-text-main">Menu</span>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-main p-1">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <nav className="p-2">
          <button
            onClick={() => { onClose(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-text-main hover:bg-dark-light transition-colors text-left"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Ask AI
          </button>

          <button
            onClick={() => { onClose(); onOpenAbout() }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-text-main hover:bg-dark-light transition-colors text-left"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            About Us
          </button>
        </nav>

        <div className="absolute bottom-4 left-0 right-0 px-4">
          <p className="text-[10px] text-text-muted text-center">Study Mate AI v1.0</p>
        </div>
      </div>
    </>
  )
}
