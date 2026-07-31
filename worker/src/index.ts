/// <reference types="@cloudflare/workers-types" />

// ── Types ──

interface QueryRequest {
  question: string
  mode: 'rag' | 'baseline_a' | 'baseline_b'
  collection: string
  topK: number
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
}

// ── Environment ──

interface Env {
  VECTORIZE: VectorizeIndex
  R2: R2Bucket
  AI: Ai
}

// ── Model ──

const LLM_MODEL = '@cf/meta/llama-3.1-8b-instruct-fp8'

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

// ── Helper: call Llama 3.1 8B via Workers AI ──

async function callLlama(ai: Ai, prompt: string, systemMsg: string): Promise<string> {
  const result = await ai.run(LLM_MODEL, {
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
    vectorDb: 'Cloudflare Vectorize',
    embeddingModel: '@cf/baai/bge-m3',
    llm: LLM_MODEL,
    provider: 'Cloudflare Workers AI',
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

  const { question, mode = 'rag', topK = 3 } = body

  if (!question || typeof question !== 'string') {
    return new Response('Missing "question" field', { status: 400 })
  }

  if (!['rag', 'baseline_a', 'baseline_b'].includes(mode)) {
    return new Response('Invalid mode. Use: rag, baseline_a, or baseline_b', { status: 400 })
  }

  if (topK < 1 || topK > 10) {
    return new Response('topK must be between 1 and 10', { status: 400 })
  }

  try {
    // Baseline A: Ungrounded — no retrieval, free-form
    if (mode === 'baseline_a') {
      const answer = await callLlama(env.AI, question, SYSTEM_FREE)
      const latencyMs = Date.now() - start
      return Response.json({
        question, answer, chunks: [], mode, collection: 'none', latencyMs,
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
      const answer = await callLlama(env.AI, prompt, SYSTEM_SINHALA)
      const latencyMs = Date.now() - start
      return Response.json({
        question, answer, chunks, mode,
        collection: body.collection || 'vectorize', latencyMs,
      } satisfies QueryResponse)
    }

    // Grounded RAG — build prompt with retrieved context
    const contextText = chunks.map((c, i) => `[${i + 1}] ${c.text}`).join('\n\n')
    const prompt = SINHALA_PROMPT
      .replace('{{context}}', contextText)
      .replace('{{question}}', question)

    const answer = await callLlama(env.AI, prompt, SYSTEM_SINHALA)
    const latencyMs = Date.now() - start

    return Response.json({
      question, answer, chunks, mode,
      collection: body.collection || 'vectorize', latencyMs,
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
    } else {
      response = new Response('Not Found', { status: 404 })
    }

    return withCors(response)
  },
}
