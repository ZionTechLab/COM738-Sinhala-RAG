import type { ModelInfo } from '../types'

interface SidebarProps {
  mode: string
  setMode: (v: string) => void
  collection: string
  setCollection: (v: string) => void
  topK: number
  setTopK: (v: number) => void
  model: string
  setModel: (v: string) => void
  availableModels: ModelInfo[]
  loading: boolean
  onClose?: () => void
}

const MODE_LABELS: Record<string, string> = {
  rag: 'Grounded RAG',
  baseline_a: 'Baseline A: Ungrounded',
  baseline_b: 'Baseline B: Constrained',
}

const COLLECTION_LABELS: Record<string, string> = {
  syllabus_paragraph_e5: 'Syllabus Paragraphs (E5)',
  syllabus_section_e5: 'Syllabus Sections (E5)',
  pastpaper_question_e5: 'Past Paper Questions (E5)',
  syllabus_sliding_e5: 'Sliding Window 800c (E5)',
}

export function Sidebar({ mode, setMode, collection, setCollection, topK, setTopK, model, setModel, availableModels, loading, onClose }: SidebarProps) {
  return (
    <aside className="bg-card border border-card-border rounded-xl p-4 md:p-5 flex flex-col gap-4 md:gap-5 w-72 shrink-0 max-h-[calc(100vh-2rem)] overflow-y-auto">
      {/* Close button — mobile only */}
      {onClose && (
        <button
          onClick={onClose}
          className="self-end text-text-muted hover:text-text-main md:hidden p-1"
          aria-label="Close menu"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <SectionHeader title="Pipeline Controls" />

      <FormGroup label="Execution Mode">
        <select
          value={mode}
          onChange={e => setMode(e.target.value)}
          disabled={loading}
          className="bg-dark border border-card-border text-text-main p-2.5 rounded-md font-sans text-sm w-full"
        >
          {Object.entries(MODE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </FormGroup>

      <FormGroup label="LLM Model">
        <select
          value={model}
          onChange={e => setModel(e.target.value)}
          disabled={loading}
          className="bg-dark border border-card-border text-text-main p-2.5 rounded-md font-sans text-sm w-full"
        >
          {availableModels.map(m => (
            <option key={m.key} value={m.key}>
              {m.name} ({m.params})
            </option>
          ))}
        </select>
      </FormGroup>

      <FormGroup label="Retrieval Collection">
        <select
          value={collection}
          onChange={e => setCollection(e.target.value)}
          disabled={loading}
          className="bg-dark border border-card-border text-text-main p-2.5 rounded-md font-sans text-sm w-full"
        >
          {Object.entries(COLLECTION_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </FormGroup>

      <FormGroup label={`Top-K Chunks: ${topK}`}>
        <input
          type="range"
          min={1}
          max={5}
          value={topK}
          onChange={e => setTopK(Number(e.target.value))}
          disabled={loading}
          className="accent-primary w-full"
        />
      </FormGroup>

      <SectionHeader title="Vector DB" />
      <StatsBox
        rows={[
          ['Collections', '4 (E5-large)'],
          ['Passages', '75 chunks'],
          ['Dim', '1024'],
          ['Norm', 'Unicode NFC'],
        ]}
      />

      <SectionHeader title="Evaluation" />
      <p className="text-xs text-text-muted leading-relaxed">
        Human evaluation by 2–3 O/L Business Studies teachers scoring answer pairs on 1–5 rubric for accuracy and faithfulness. Wilcoxon signed-rank test for paired comparison.
      </p>
    </aside>
  )
}

function SectionHeader({ title }: { title: string }) {
  return <div className="text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-wider">{title}</div>
}

function FormGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text-main">{label}</label>
      {children}
    </div>
  )
}

function StatsBox({ rows }: { rows: [string, string][] }) {
  return (
    <div className="bg-dark/60 border border-card-border rounded-lg p-3 font-mono text-xs flex flex-col gap-1.5">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between">
          <span className="text-text-muted">{k}:</span>
          <span className="text-primary font-semibold">{v}</span>
        </div>
      ))}
    </div>
  )
}
