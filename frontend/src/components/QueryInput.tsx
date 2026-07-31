import { useState } from 'react'

interface QueryInputProps {
  onQuery: (question: string) => void
  loading: boolean
}

const SAMPLES = [
  'ව්‍යාපාර සංවිධාන වර්ග මොනවාද?',
  'ගිණුම්කරණ සමීකරණය යනු කුමක්ද?',
  'සුළු මුදල් පොතක් පවත්වාගෙන යාමේ වාසි මොනවාද?',
  'බැංකු සැසඳීම් ප්‍රකාශනයක් පිළියෙල කරන්නේ ඇයි?',
]

export function QueryInput({ onQuery, loading }: QueryInputProps) {
  const [value, setValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = value.trim()
    if (!q || loading) return
    onQuery(q)
  }

  return (
    <div className="bg-card border border-card-border rounded-xl p-5">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="සිංහල පාඩම් මාලාවෙන් ප්‍රශ්නයක් අසන්න..."
          disabled={loading}
          className="flex-1 bg-dark border border-card-border text-text-main px-5 py-3 rounded-lg font-sinhala text-base focus:outline-none focus:border-primary disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="bg-primary text-white border-none px-6 py-3 rounded-lg font-semibold cursor-pointer hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {loading ? 'සොයමින්...' : 'පිළිතුර ලබාගන්න'}
        </button>
      </form>

      <div className="flex gap-2 mt-3 flex-wrap">
        <span className="text-xs text-text-muted mr-1 self-center">නිදසුන්:</span>
        {SAMPLES.map(s => (
          <button
            key={s}
            onClick={() => { setValue(s); onQuery(s) }}
            disabled={loading}
            className="bg-slate-800/50 border border-card-border text-text-muted px-3 py-1 rounded-full text-xs cursor-pointer hover:text-text-main hover:border-primary transition-colors disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
