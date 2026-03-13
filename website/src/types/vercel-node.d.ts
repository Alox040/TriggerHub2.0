declare module '@vercel/node' {
  export interface VercelRequest {
    method?: string
    headers: Record<string, string | undefined>
    body?: unknown
    query?: Record<string, string | string[] | undefined>
  }

  export interface VercelResponse {
    status(code: number): VercelResponse
    setHeader(name: string, value: string): VercelResponse
    send(body: string): void
    json?(body: unknown): void
  }
}
