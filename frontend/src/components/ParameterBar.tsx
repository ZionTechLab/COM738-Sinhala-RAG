import { useState } from 'react'
import type { ModelInfo } from '../types'

interface ParameterBarProps {
  mode: 'rag' | 'baseline_a' | 'baseline_b'
  setMode: (v: 'rag' | 'baseline_a' | 'baseline_b') => void
  collection: string
  setCollection: (v: string) => void
  topK: number
  setTopK: (v: number) => void
  model: string
  setModel: (v: string) => void
  availableModels: ModelInfo[]
  loading: boolean
}

const MODE_LABELS: Record<string, string> = {
  rag: 'Grounded RAG',
  baseline_a: 'Baseline A: Ungrounded',
  baseline_b: 'Baseline B: Constrained',
}

const COLLECTION_LABELS: Record<string, string> = {
  syllabus_paragraph_e5: 'Syllabus Paragraphs',
  syllabus_section_e5: 'Syllabus Sections',
  pastpaper_question_e5: 'Past Paper Questions',
  syllabus_sliding_e5: 'Sliding Window',
}

export function ParameterBar({ mode, setMode, collection, setCollection, topK, setTopK, model, setModel, availableModels, loading }: ParameterBarProps) {
  const [open, setOpen] = useState(false)

  const currentModel = availableModels.find(m => m.key === model)
  const modelShort = currentModel?.name || model

  return (
    <>
      {/* Minimal summary bar with tags */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 bg-card border border-card-border rounded-xl px-4 py-2.5 cursor-pointer hover:border-primary/50 transition-colors text-left w-full"
      >
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="text-primary shrink-0">
          <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>

        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap flex-1">
          {/* Subject tag */}
          <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap">Business Studies</span>
          {/* Grade tag */}
          <span className="bg-accent-blue/10 text-accent-blue border border-accent-blue/20 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap">O/L</span>
          {/* Mode tag */}
          <span className="bg-tag-bg text-tag-text border border-tag-bg px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap">{mode === 'rag' ? 'RAG' : mode === 'baseline_a' ? 'Ungrounded' : 'Constrained'}</span>
          {/* Model tag */}
          <span className="bg-slate-700/40 text-slate-300 border border-slate-600/30 px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap truncate max-w-[120px]">{modelShort}</span>
          {/* Top-K tag */}
          <span className="bg-slate-700/40 text-slate-300 border border-slate-600/30 px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap">Top-{topK}</span>
        </div>

        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={`text-text-muted shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Popup */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setOpen(false)}>
          <div
            className="bg-card border border-card-border rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-text-main">Settings</h3>
              <button onClick={() => setOpen(false)} className="text-text-muted hover:text-text-main p-1">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Subject + Grade */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1.5 block">Subject</label>
                  <select className="bg-dark border border-card-border text-text-main p-2 rounded-lg font-sans text-sm w-full">
                    <option>Business Studies</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1.5 block">Grade</label>
                  <select className="bg-dark border border-card-border text-text-main p-2 rounded-lg font-sans text-sm w-full">
                    <option>O/L</option>
                  </select>
                </div>
              </div>

              <hr className="border-card-border" />

              {/* Mode */}
              <div>
                <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1.5 block">Execution Mode</label>
                <select value={mode} onChange={e => setMode(e.target.value as typeof mode)} disabled={loading}
                  className="bg-dark border border-card-border text-text-main p-2 rounded-lg font-sans text-sm w-full">
                  {Object.entries(MODE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>

              {/* Model */}
              <div>
                <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1.5 block">LLM Model</label>
                <select value={model} onChange={e => setModel(e.target.value)} disabled={loading}
                  className="bg-dark border border-card-border text-text-main p-2 rounded-lg font-sans text-sm w-full">
                  {availableModels.map(m => <option key={m.key} value={m.key}>{m.name} ({m.params})</option>)}
                </select>
              </div>

              {/* Collection */}
              <div>
                <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1.5 block">Retrieval Collection</label>
                <select value={collection} onChange={e => setCollection(e.target.value)} disabled={loading}
                  className="bg-dark border border-card-border text-text-main p-2 rounded-lg font-sans text-sm w-full">
                  {Object.entries(COLLECTION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>

              {/* Top-K */}
              <div>
                <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1.5 block">Top-K Chunks: {topK}</label>
                <input type="range" min={1} max={5} value={topK} onChange={e => setTopK(Number(e.target.value))} disabled={loading} className="accent-primary w-full" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
