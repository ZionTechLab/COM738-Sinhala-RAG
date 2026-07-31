export interface QueryRequest {
  question: string
  mode: 'rag' | 'baseline_a' | 'baseline_b'
  collection: string
  topK: number
}

export interface RetrievedChunk {
  id: string
  text: string
  source: string
  chunkStrategy: string
  distance: number
}

export interface RAGASMetrics {
  faithfulness: number
  answerRelevance: number
  contextPrecision: number
}

export interface QueryResponse {
  question: string
  answer: string
  chunks: RetrievedChunk[]
  mode: string
  collection: string
  latencyMs: number
  metrics?: RAGASMetrics
}

export interface HealthResponse {
  status: string
  vectorDb: string
  collections: string[]
  embeddingModel: string
}
