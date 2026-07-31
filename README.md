# COM738 — RAG Architecture for Sinhala Secondary Education

> **MSc Dissertation · Wrexham University via Londontec**
> **Student:** M.A.A.T. Perera (S25021960) · **Deadline:** Aug 2, 2026

---

## What this is

A full-stack web application that lets O/L Business Studies teachers ask Sinhala-language questions and get answers grounded in the NIE curriculum — not hallucinations.

**Live URL:** `https://rag.zionsl.com`

Backed by: React 19 + Cloudflare Workers + Vectorize + Workers AI + DeepSeek v4 Pro.

---

## Architecture

```
Browser (rag.zionsl.com)
   │
   ▼
Cloudflare Pages (React SPA)  ← frontend/
   │ /api/query
   ▼
Cloudflare Worker             ← worker/src/index.ts
   ├─ BGE-M3 embedding (Workers AI)
   ├─ Vector search (Vectorize)
   └─ Generation (DeepSeek v4 via 9router)
```

Three modes:
- **Grounded RAG** — syllabus-grounded, with retrieved context
- **Baseline A** — ungrounded LLM, hallucinates freely
- **Baseline B** — constrained prompt, no retrieval (forces refusal when unsure)

---

## Quick Reference

| What | Where |
|---|---|
| Frontend code | `frontend/src/` |
| Worker backend | `worker/src/index.ts` |
| Cloudflare config | `worker/wrangler.toml` |
| Setup instructions | `CLOUDFLARE_SETUP.md` |
| CI/CD workflow | `.github/workflows/deploy.yml` |
| Existing ChromaDB (migrate) | `~/projects/com738-dissertation/chroma_db/` |
| UI prototype (HTML) | `~/projects/com738-dissertation/prototype_gui.html` |

---

## Morning Setup Checklist (Thilina)

1. `cd frontend && npm install && npm run build` — verify frontend builds
2. `npm install -g wrangler && wrangler login` — install + auth
3. Follow `CLOUDFLARE_SETUP.md` steps 1-13 in order
4. Migrate ChromaDB data → Vectorize (Step 11)
5. Test: `curl https://rag.zionsl.com/api/health`

---

## Evaluation

- **Human validation only** (no AI-as-judge) — 2-3 O/L Business Studies teachers score 25 answer pairs on 1-5 rubric
- Wilcoxon signed-rank test for RAG vs baseline comparison
- Metadata collected per query: collection, mode, latency, chunk distances
