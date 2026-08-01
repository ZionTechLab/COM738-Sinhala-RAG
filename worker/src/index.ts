/// <reference types="@cloudflare/workers-types" />

// ── Types ──

interface QueryRequest {
  question: string
  mode: 'rag' | 'baseline_a' | 'baseline_b'
  collection: string
  topK: number
  model?: string
}

interface Chunk {
  id: string
  text: string
  source: string
  chunkStrategy: string
  distance: number
}

interface QueryResponse {
  question: string
  answer: string
  chunks: Chunk[]
  mode: string
  collection: string
  latencyMs: number
  model: string
}

// ── Environment ──

interface Env {
  VECTORIZE: VectorizeIndex
  R2: R2Bucket
  AI: Ai
}

// ── Available Models (Cloudflare Workers AI free tier) ──

const MODELS: Record<string, { id: string; name: string; params: string }> = {
  'llama-8b':  { id: '@cf/meta/llama-3.1-8b-instruct-fp8',        name: 'Llama 3.1 8B',    params: '8B' },
  'llama-70b': { id: '@cf/meta/llama-3.1-70b-instruct-fp8-fast',   name: 'Llama 3.1 70B',   params: '70B' },
  'llama-33':  { id: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',   name: 'Llama 3.3 70B',   params: '70B' },
}

const DEFAULT_MODEL = 'llama-8b'

// ── Vectorize collection names (metadata filter targets) ──
// All 75 passages were migrated to the single com738-rag-index.
// "collection" is the chunking strategy used — passed as metadata filter.
// Available: syllabus_paragraph_e5, syllabus_section_e5, pastpaper_question_e5, syllabus_sliding_e5

// ── Sinhala prompts ──

const SINHALA_PROMPT = `ඔබ ශ්‍රී ලංකාවේ අ.පො.ස. (සාමාන්‍ය පෙළ) ව්‍යාපාර සහ ගිණුම්කරණ අධ්‍යයන විෂය සඳහා සහායකයෙකි.
පහත දැක්වෙන පෙළ කොටස් පමණක් භාවිතා කර පිළිතුරු සපයන්න.
පෙළ කොටස්වල අඩංගු නොවන තොරතුරු එකතු නොකරන්න.
පෙළ කොටස් ප්‍රමාණවත් නොවේ නම්, "මෙම තොරතුරු විෂය නිර්දේශයේ අඩංගු නොවේ" යනුවෙන් සඳහන් කරන්න.
සිංහල භාෂාවෙන් පමණක් පිළිතුරු දෙන්න.

පෙළ කොටස්:
{{context}}

ප්‍රශ්නය: {{question}}
පිළිතුර:`

const CONSTRAINED_PROMPT = `ඔබ ශ්‍රී ලංකාවේ අ.පො.ස. (සාමාන්‍ය පෙළ) ව්‍යාපාර සහ ගිණුම්කරණ අධ්‍යයන විෂය සඳහා සහායකයෙකි.
පහත දැක්වෙන විෂය නිර්දේශයේ අන්තර්ගතය පමණක් භාවිතා කර පිළිතුරු සපයන්න.
තොරතුරු නොමැති නම්, "මෙම තොරතුරු විෂය නිර්දේශයේ අඩංගු නොවේ" යනුවෙන් සඳහන් කරන්න.

ප්‍රශ්නය: {{question}}
පිළිතුර:`

const SYSTEM_SINHALA = 'You are a Sinhala-language teaching assistant for Sri Lanka O/L Business Studies. Reply in Sinhala only. Use only the provided context. Do not invent information not found in the context.'

const SYSTEM_FREE = 'You are a helpful assistant. Reply in Sinhala.'

// ── Helper: call model via Workers AI ──

async function callModel(ai: Ai, modelId: string, prompt: string, systemMsg: string): Promise<string> {
  const result = await ai.run(modelId, {
    messages: [
      { role: 'system', content: systemMsg },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 1024,
  }) as { response?: string }

  return result.response || ''
}

// ── Helper: generate embedding via Workers AI ──

async function embedQuery(ai: Ai, query: string): Promise<number[]> {
  const result = await ai.run('@cf/baai/bge-m3', {
    text: [`query: ${query}`],
  }) as { data: number[][] }

  return result.data[0]
}

// ── Routes ──

async function handleHealth(): Promise<Response> {
  return Response.json({
    status: 'ok',
    vectorDb: 'Cloudflare Vectorize (com738-rag-index)',
    embeddingModel: '@cf/baai/bge-m3',
    availableModels: Object.keys(MODELS).map(k => ({ key: k, ...MODELS[k] })),
    defaultModel: DEFAULT_MODEL,
    provider: 'Cloudflare Workers AI (free tier)',
    timestamp: new Date().toISOString(),
  })
}

async function handleQuery(request: Request, env: Env): Promise<Response> {
  const start = Date.now()
  let body: QueryRequest

  try {
    body = await request.json() as QueryRequest
  } catch {
    return new Response('Invalid JSON body', { status: 400 })
  }

  const { question, mode = 'rag', topK = 3, model: modelKey = DEFAULT_MODEL } = body

  if (!question || typeof question !== 'string') {
    return new Response('Missing "question" field', { status: 400 })
  }

  if (!['rag', 'baseline_a', 'baseline_b'].includes(mode)) {
    return new Response('Invalid mode. Use: rag, baseline_a, or baseline_b', { status: 400 })
  }

  if (topK < 1 || topK > 10) {
    return new Response('topK must be between 1 and 10', { status: 400 })
  }

  const modelInfo = MODELS[modelKey]
  if (!modelInfo) {
    return new Response(`Unknown model: ${modelKey}. Available: ${Object.keys(MODELS).join(', ')}`, { status: 400 })
  }

  const modelId = modelInfo.id

  try {
    // Baseline A: Ungrounded — no retrieval, free-form
    if (mode === 'baseline_a') {
      const answer = await callModel(env.AI, modelId, question, SYSTEM_FREE)
      const latencyMs = Date.now() - start
      return Response.json({
        question, answer, chunks: [], mode, collection: 'none', latencyMs, model: modelKey,
      } satisfies QueryResponse)
    }

    // Embed + retrieve
    const queryEmbedding = await embedQuery(env.AI, question)
    const results = await env.VECTORIZE.query(queryEmbedding, {
      topK,
      returnMetadata: true,
      returnValues: true,
    })

    const chunks: Chunk[] = results.matches.map(m => ({
      id: m.id,
      text: (m.metadata?.text as string) || '',
      source: (m.metadata?.source as string) || 'unknown',
      chunkStrategy: (m.metadata?.chunk_strategy as string) || 'unknown',
      distance: m.score || 0,
    }))

    // Baseline B: Constrained prompt — empty context
    if (mode === 'baseline_b') {
      const prompt = CONSTRAINED_PROMPT.replace('{{question}}', question)
      const answer = await callModel(env.AI, modelId, prompt, SYSTEM_SINHALA)
      const latencyMs = Date.now() - start
      return Response.json({
        question, answer, chunks, mode,
        collection: body.collection || 'vectorize', latencyMs, model: modelKey,
      } satisfies QueryResponse)
    }

    // Grounded RAG — build prompt with retrieved context
    const contextText = chunks.map((c, i) => `[${i + 1}] ${c.text}`).join('\n\n')
    const prompt = SINHALA_PROMPT
      .replace('{{context}}', contextText)
      .replace('{{question}}', question)

    const answer = await callModel(env.AI, modelId, prompt, SYSTEM_SINHALA)
    const latencyMs = Date.now() - start

    return Response.json({
      question, answer, chunks, mode,
      collection: body.collection || 'vectorize', latencyMs, model: modelKey,
    } satisfies QueryResponse)

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    console.error('Query error:', message)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// ── CORS ──

function withCors(response: Response): Response {
  const headers = new Headers(response.headers)
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}

// ── Router ──

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return withCors(new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }))
    }

    let response: Response

    if (url.pathname === '/api/health' && request.method === 'GET') {
      response = await handleHealth()
    } else if (url.pathname === '/api/query' && request.method === 'POST') {
      response = await handleQuery(request, env)
    } else if (url.pathname === '/health' && request.method === 'GET') {
      response = await handleHealth()
    } else {
      response = new Response('Not Found', { status: 404 })
    }

    return withCors(response)
  },
}
