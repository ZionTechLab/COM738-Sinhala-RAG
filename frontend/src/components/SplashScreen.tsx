import { useEffect, useState } from 'react'

interface SplashScreenProps {
  onDone: () => void
}

export function SplashScreen({ onDone }: SplashScreenProps) {
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 2000)
    const t2 = setTimeout(onDone, 2500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-dark transition-opacity duration-500 ${fading ? 'opacity-0' : 'opacity-100'}`}>
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <svg width="44" height="44" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-text-main">Study Mate AI</h1>
        <p className="text-sm text-text-muted">O/L Business Studies · Sinhala</p>
        <div className="w-32 h-1 bg-slate-700 rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-sky-600 rounded-full animate-pulse" style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  )
}
