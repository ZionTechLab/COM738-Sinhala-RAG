interface GeneratedAnswerProps {
  answer: string
  mode: string
  latencyMs: number
  loading: boolean
}

const MODE_PILLS: Record<string, { label: string; bg: string; color: string }> = {
  rag: { label: 'Llama 3.1 8B · Grounded', bg: 'bg-tag-bg', color: 'text-tag-text' },
  baseline_a: { label: 'Ungrounded LLM', bg: 'bg-red-950', color: 'text-red-400' },
  baseline_b: { label: 'Constrained · No Context', bg: 'bg-amber-950', color: 'text-amber-400' },
}

export function GeneratedAnswer({ answer, mode, latencyMs, loading }: GeneratedAnswerProps) {
  const pill = MODE_PILLS[mode] || MODE_PILLS.rag

  if (loading) {
    return (
      <div className="bg-card border border-card-border rounded-xl p-5 min-h-[200px] flex items-center justify-center">
        <div className="flex items-center gap-3 text-text-muted">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="font-sans text-sm">Generating answer...</span>
        </div>
      </div>
    )
  }

  if (!answer) {
    return (
      <div className="bg-card border border-card-border rounded-xl p-5 min-h-[200px] flex items-center justify-center">
        <p className="text-text-muted font-sans text-sm">Ask a question to see the generated answer.</p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-card-border rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3 justify-between flex-wrap">
        <h2 className="text-sm font-bold text-text-main uppercase tracking-wide">Generated Answer</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${pill.bg} ${pill.color}`}>
            {pill.label}
          </span>
          {latencyMs > 0 && (
            <span className="text-xs text-text-muted font-mono">{latencyMs}ms</span>
          )}
        </div>
      </div>
      <div className="bg-dark/60 border border-card-border rounded-lg p-4 font-sinhala text-text-main text-sm leading-relaxed whitespace-pre-wrap">
        {answer}
      </div>
    </div>
  )
}
