export interface QueryRequest {
  question: string
  mode: 'rag' | 'baseline_a' | 'baseline_b'
  collection: string
  topK: number
  model?: string  // user-selectable model
}

export interface RetrievedChunk {
  id: string
  text: string
  source: string
  chunkStrategy: string
  distance: number
}

export interface ModelInfo {
  key: string
  id: string
  name: string
  params: string
}

export interface QueryResponse {
  question: string
  answer: string
  chunks: RetrievedChunk[]
  mode: string
  collection: string
  latencyMs: number
  model?: string
}

export interface HealthResponse {
  status: string
  vectorDb: string
  embeddingModel: string
  availableModels?: ModelInfo[]
  defaultModel?: string
  provider?: string
}
