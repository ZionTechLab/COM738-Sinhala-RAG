import type { QueryRequest, QueryResponse, HealthResponse } from '../types'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export async function queryRAG(req: QueryRequest): Promise<QueryResponse> {
  const res = await fetch(`${API_BASE}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Query failed (${res.status}): ${err}`)
  }
  return res.json()
}

export async function healthCheck(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`)
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`)
  return res.json()
}
