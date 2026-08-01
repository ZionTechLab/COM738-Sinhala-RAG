interface AboutModalProps {
  open: boolean
  onClose: () => void
}

export function AboutModal({ open, onClose }: AboutModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-card border border-card-border rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl animate-fade-in max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-text-main">About Us</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-main p-1">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg width="34" height="34" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h3 className="text-base font-bold text-text-main">Study Mate AI</h3>
          <p className="text-xs text-text-muted text-center leading-relaxed">
            Study Mate AI is a Sinhala-language educational assistant designed for Sri Lankan G.C.E. O/L Business & Accounting Studies students. It uses Retrieval-Augmented Generation (RAG) to answer questions grounded in the official NIE curriculum — syllabus, textbooks, teacher guides, and past examination papers.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-xs">
          <div className="bg-dark border border-card-border rounded-lg p-3">
            <span className="font-semibold text-primary">Research Context</span>
            <p className="text-text-muted mt-1">COM738 MSc Dissertation — Wrexham University / Londontec City Campus, 2026. Investigating RAG-based hallucination mitigation for low-resource language educational content.</p>
          </div>

          <div className="bg-dark border border-card-border rounded-lg p-3">
            <span className="font-semibold text-primary">Researcher</span>
            <p className="text-text-muted mt-1">M.A.A.T. Perera (S25021960)</p>
          </div>

          <div className="bg-dark border border-card-border rounded-lg p-3">
            <span className="font-semibold text-primary">Supervisor</span>
            <p className="text-text-muted mt-1">Mr. Lakshman Jayaweera</p>
          </div>

          <div className="bg-dark border border-card-border rounded-lg p-3">
            <span className="font-semibold text-primary">Knowledge Base</span>
            <p className="text-text-muted mt-1">NIE G.C.E. O/L Business Studies Syllabus (2016), NIE Textbook & Teacher's Guide (Sinhala medium), G.C.E. O/L past papers & model papers (2013–2024), Provincial Department of Education term test papers.</p>
          </div>

          <div className="bg-dark border border-card-border rounded-lg p-3">
            <span className="font-semibold text-primary">Technology</span>
            <p className="text-text-muted mt-1">RAG architecture with multilingual-E5 embeddings, Cloudflare Workers AI + Google Gemini, Chroma vector database, React + TypeScript frontend.</p>
          </div>

          <p className="text-[10px] text-text-muted text-center mt-2">
            © 2026 · COM738 Dissertation Artifact · All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
