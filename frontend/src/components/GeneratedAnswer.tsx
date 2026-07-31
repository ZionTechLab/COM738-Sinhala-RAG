import type { RAGASMetrics } from '../types'

interface GeneratedAnswerProps {
  answer: string
  mode: string
  metrics?: RAGASMetrics
  latencyMs: number
  loading: boolean
}

const MODE_PILLS: Record<string, { label: string; bg: string; color: string }> = {
  rag: { label: 'DeepSeek v4 · Grounded', bg: 'bg-tag-bg', color: 'text-tag-text' },
  baseline_a: { label: 'Ungrounded LLM', bg: 'bg-red-950', color: 'text-red-400' },
  baseline_b: { label: 'Constrained · No Context', bg: 'bg-amber-950', color: 'text-amber-400' },
}

export function GeneratedAnswer({ answer, mode, metrics, latencyMs, loading }: GeneratedAnswerProps) {
  const pill = MODE_PILLS[mode] || MODE_PILLS.rag

  return (
    <div className="bg-card border border-card-border rounded-xl p-5 flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-card-border pb-3 flex-wrap gap-2">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          ජනනය කළ පිළිතුර
        </h3>
        <span className={`${pill.bg} ${pill.color} text-xs px-2 py-0.5 rounded-full font-semibold`}>
          {pill.label}
        </span>
      </div>

      {loading && (
        <div className="text-text-muted text-sm py-8 text-center animate-pulse">
          Generating answer from grounded context...
        </div>
      )}

      {!loading && !answer && (
        <div className="text-text-muted text-sm py-8 text-center">
          Ask a question to see the model's response grounded on retrieved syllabus content.
        </div>
      )}

      {!loading && answer && (
        <>
          <div className="bg-dark border border-card-border rounded-lg p-5 text-sm leading-relaxed whitespace-pre-line">
            {answer}
          </div>
          <div className="text-xs text-text-muted font-mono">
            Latency: {latencyMs}ms
          </div>
        </>
      )}

      {metrics && (
        <>
          <div className="text-xs font-bold text-text-muted uppercase tracking-wider mt-2">RAGAS Metrics</div>
          <div className="grid grid-cols-3 gap-2.5">
            <MetricCard label="Faithfulness" value={metrics.faithfulness} />
            <MetricCard label="Answer Relevance" value={metrics.answerRelevance} />
            <MetricCard label="Context Precision" value={metrics.contextPrecision} />
          </div>
        </>
      )}
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-dark border border-card-border rounded-lg p-2.5 text-center">
      <div className="text-lg font-bold text-primary font-mono">{value.toFixed(2)}</div>
      <div className="text-[10px] text-text-muted mt-0.5">{label}</div>
    </div>
  )
}
