interface GeneratedAnswerProps {
  answer: string
  latencyMs: number
  loading: boolean
}

export function GeneratedAnswer({ answer, latencyMs, loading }: GeneratedAnswerProps) {
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
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-text-main uppercase tracking-wide">Generated Answer</h2>
        {latencyMs > 0 && (
          <span className="text-xs text-text-muted font-mono">{latencyMs}ms</span>
        )}
      </div>
      <div className="bg-dark/60 border border-card-border rounded-lg p-4 font-sinhala text-text-main text-sm leading-relaxed whitespace-pre-wrap">
        {answer}
      </div>
    </div>
  )
}
