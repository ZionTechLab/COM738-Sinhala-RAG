# COM738 RAG Architecture — Full Implementation

> **Student:** M.A.A.T. Perera (S25021960)
> **Module:** COM738 — MSc Dissertation, Wrexham University via Londontec
> **Stack:** React 19 + Vite 8 + Tailwind 4 + TypeScript 6 (frontend) / Cloudflare Workers + Vectorize + R2 + Workers AI (backend) / DeepSeek v4 Pro via 9router (LLM)

---

## 📁 Project Structure

```
com738-rag-app/
├── frontend/              ← React + Vite + Tailwind SPA
│   ├── src/
│   │   ├── components/    ← Header, Sidebar, QueryInput, ChunkList, GeneratedAnswer, Footer
│   │   ├── lib/api.ts     ← Backend API client
│   │   ├── types.ts       ← TypeScript interfaces
│   │   ├── App.tsx         ← Main layout
│   │   ├── main.tsx        ← Entry point
│   │   └── index.css       ← Tailwind imports + custom theme
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   └── tsconfig.json
├── worker/                ← Cloudflare Worker backend
│   ├── src/index.ts       ← Main worker: router, query, embed, health
│   ├── wrangler.toml      ← Cloudflare bindings (Vectorize, R2)
│   └── package.json
├── .github/workflows/
│   └── deploy.yml         ← CI/CD: auto-deploy on git push
└── CLOUDFLARE_SETUP.md    ← this file
```

---

## 🔧 Prerequisites

Before starting, make sure you have:

1. **Cloudflare account** → https://dash.cloudflare.com/sign-up
2. **Node.js 22+** → `node --version` (you already have v22.23.1)
3. **npm** → comes with Node.js
4. **DeepSeek v4 Pro API key** → from your 9router setup
5. **zionsl.com DNS managed by Cloudflare** → for subdomain `rag.zionsl.com`

---

## 🚀 Step-by-Step Cloudflare Setup

### Step 0: Install Wrangler CLI

```bash
npm install -g wrangler
wrangler --version
wrangler login
```

The `wrangler login` command opens a browser. Click "Allow" to authorize.

---

### Step 1: Install Frontend Dependencies

```bash
cd ~/projects/com738-rag-app/frontend
npm install
```

Verify it works locally:

```bash
npm run dev
```

Open http://localhost:5173 — you should see the Sinhala RAG interface.

---

### Step 2: Create Cloudflare Pages Project (Frontend)

```bash
cd ~/projects/com738-rag-app/frontend
npx wrangler pages project create com738-rag-frontend --production-branch=main
```

**Expected output:** `Successfully created the 'com738-rag-frontend' project.`

---

### Step 3: Create Cloudflare Vectorize Index

```bash
npx wrangler vectorize create com738-rag-index --dimensions=1024 --metric=cosine
```

**Expected output:** `✅ Successfully created index 'com738-rag-index'`

This index stores 1024-dimensional embeddings from BGE-M3.

---

### Step 4: Create Cloudflare R2 Bucket

```bash
npx wrangler r2 bucket create com738-rag-pdfs
```

**Expected output:** `✅ Created bucket 'com738-rag-pdfs'`

This bucket stores the NIE syllabus PDFs and past papers.

---

### Step 5: Enable Workers AI

1. Go to Cloudflare Dashboard → Workers & Pages
2. Click your worker: `com738-rag-worker`
3. Settings → AI → Enable
4. Note: BGE-M3 (`@cf/baai/bge-m3`) is automatically available

---

### Step 6: Install Worker Dependencies

```bash
cd ~/projects/com738-rag-app/worker
npm install
```

---

### Step 7: Set Secrets (DeepSeek API)

```bash
cd ~/projects/com738-rag-app/worker
npx wrangler secret put DEEPSEEK_API_KEY
# Paste your DeepSeek/9router API key when prompted

npx wrangler secret put DEEPSEEK_BASE_URL
# Paste: https://api.9router.ai/v1
```

---

### Step 8: Deploy Worker (Backend)

```bash
cd ~/projects/com738-rag-app/worker
npx wrangler deploy
```

**Expected output:** `Deployed 'com738-rag-worker' (https://com738-rag-worker.<your-subdomain>.workers.dev)`

Test the health endpoint:

```bash
curl https://com738-rag-worker.<your-subdomain>.workers.dev/api/health
```

**Expected response:**
```json
{
  "status": "ok",
  "vectorDb": "Cloudflare Vectorize",
  "embeddingModel": "@cf/baai/bge-m3",
  "provider": "Cloudflare Workers AI",
  "timestamp": "2026-07-30T..."
}
```

---

### Step 9: Build + Deploy Frontend

```bash
cd ~/projects/com738-rag-app/frontend
npm run build
npx wrangler pages deploy dist --project-name=com738-rag-frontend --branch=main
```

**Expected output:** `✨ Success! Uploaded X files`

---

### Step 10: Set Up Subdomain (rag.zionsl.com)

1. Go to Cloudflare Dashboard → your zionsl.com zone
2. Click your Frontend Pages project: `com738-rag-frontend`
3. Go to "Custom domains" tab
4. Click "Set up a custom domain"
5. Enter: `rag.zionsl.com`
6. Cloudflare auto-creates the DNS CNAME record

Wait 2-5 minutes for SSL provisioning. Then visit:

👉 **https://rag.zionsl.com**

---

### Step 11: Migrate Existing ChromaDB Data to Vectorize

Your existing ChromaDB has 75 passages across 4 collections. Run the migration script:

```bash
cd ~/projects/com738-dissertation
python3 -c "
import chromadb, json, requests

# Load from ChromaDB
client = chromadb.PersistentClient(path='chroma_db')
collections = client.list_collections()

# Collect all passages
passages = []
for col in collections:
    name = col.name
    data = col.get(include=['documents', 'metadatas', 'embeddings'])
    for i, (doc, meta, emb) in enumerate(zip(data['documents'] or [], data['metadatas'] or [], data['embeddings'] or [])):
        passages.append({
            'id': f'{name}_{i}',
            'text': doc,
            'metadata': {**(meta or {}), 'collection': name},
            'values': emb,
        })

print(f'Total passages to migrate: {len(passages)}')

# Save as JSONL for wrangler import
with open('/tmp/com738_passages.jsonl', 'w', encoding='utf-8') as f:
    for p in passages:
        f.write(json.dumps(p, ensure_ascii=False) + '\n')

print('Saved to /tmp/com738_passages.jsonl')
"
```

Then import to Vectorize (after deploying worker):

```bash
# This uses wrangler vectorize insert — requires wrangler >= 3.50
cd ~/projects/com738-rag-app/worker
npx wrangler vectorize insert com738-rag-index --file=/tmp/com738_passages.jsonl
```

**If the above wrangler command fails** (depends on wrangler version), upload via REST:

```bash
# Set your Cloudflare account ID + API token
CF_ACCOUNT_ID="<your-account-id>"
CF_API_TOKEN="<your-api-token>"
INDEX_NAME="com738-rag-index"

curl -X POST \
  "https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/vectorize/v2/indexes/${INDEX_NAME}/upsert" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$(cat /tmp/com738_passages.jsonl)"
```

---

### Step 12: Set Up GitHub Repository + CI/CD

```bash
cd ~/projects/com738-rag-app

# Initialize git
git init
git add -A
git commit -m "Initial commit: COM738 RAG frontend + worker"

# Create repo on GitHub (CLI or web)
gh repo create Wrexham/COM738-RAG-Prototype --public --source=. --push
```

Add secrets to GitHub:

1. Go to repo → Settings → Secrets and variables → Actions
2. Add:
   - `CLOUDFLARE_API_TOKEN` — your Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID` — your Cloudflare account ID

Push to main branch → GitHub Actions auto-deploys frontend + worker.

---

### Step 13: Test End-to-End

```bash
# Health check
curl https://rag.zionsl.com/api/health

# Query test
curl -X POST https://rag.zionsl.com/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "ව්‍යාපාර සංවිධාන වර්ග මොනවාද?",
    "mode": "rag",
    "collection": "vectorize",
    "topK": 3
  }'
```

**Expected:** JSON response with chunks + Sinhala answer.

---

## 📊 Architecture Diagram

```
┌──────────────────────────────────────────────────┐
│  User Browser                                   │
│  https://rag.zionsl.com                         │
└────────────────────┬─────────────────────────────┘
                     │ HTTPS
                     ▼
┌──────────────────────────────────────────────────┐
│  Cloudflare Pages (react)                        │
│  • React 19 + Vite 8 + Tailwind 4               │
│  • Sinhala UI components                         │
│  • API calls to /api/*                           │
└────────────────────┬─────────────────────────────┘
                     │ /api/query, /api/health
                     ▼
┌──────────────────────────────────────────────────┐
│  Cloudflare Worker (TypeScript)                  │
│  • Request validation                            │
│  • Embedding generation (Workers AI BGE-M3)      │
│  • Vector retrieval (Vectorize)                  │
│  • Prompt assembly (Sinhala template)             │
│  • DeepSeek v4 Pro call (9router)                │
│  • Response formatting                            │
└────────────────────┬─────────────────────────────┘
          ┌──────────┼──────────┐
          ▼          ▼          ▼
   ┌──────────┐ ┌────────┐ ┌──────────────┐
   │Vectorize │ │  R2    │ │ DeepSeek v4  │
   │(vectors) │ │ (PDFs) │ │ via 9router  │
   └──────────┘ └────────┘ └──────────────┘
```

---

## 🔑 Environment Variables / Secrets

| Name | Where | Purpose |
|---|---|---|
| `DEEPSEEK_API_KEY` | Worker secret | Authenticate with 9router DeepSeek API |
| `DEEPSEEK_BASE_URL` | Worker secret | DeepSeek API base (default: `https://api.9router.ai/v1`) |
| `CLOUDFLARE_API_TOKEN` | GitHub secret | Deploy from CI/CD |
| `CLOUDFLARE_ACCOUNT_ID` | GitHub secret | Deploy from CI/CD |

---

## 🐛 Troubleshooting

| Problem | Solution |
|---|---|
| `wrangler: command not found` | `npm install -g wrangler` |
| Worker returns 500 | Check `npx wrangler tail` for logs |
| DeepSeek API 401 | Verify `DEEPSEEK_API_KEY` secret → `npx wrangler secret list` |
| BGE-M3 not available | Enable Workers AI in Cloudflare Dashboard |
| Vectorize query empty | Migrate ChromaDB data → Step 11 |
| DNS not resolving | Wait 5 min for Cloudflare SSL provisioning |
| CORS error in browser | Worker already handles CORS — check browser network tab |

---

## 📝 Notes for Dissertation

- **Chapter 3 (Methodology)** — reference this architecture: *"A serverless RAG system deployed on Cloudflare's edge platform using Workers AI for Sinhala embedding generation and DeepSeek v4 Pro for Sinhala answer generation, evaluated against two baselines with human validation by 2-3 O/L Business Studies teachers."*
- **Chapter 4 (System Design)** — can reference the component architecture and the migration from ChromaDB to Cloudflare Vectorize
- **Chapter 5 (Results)** — end-to-end latency, retrieval precision, human eval scores
- **Poster** — QR code linking to `https://rag.zionsl.com` so examiners can try it live

---

*Generated: Jul 29, 2026*
*By: Nia (DeepSeek v4 Pro), on behalf of M.A.A.T. Perera*
