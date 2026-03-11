export interface ClipCaptureInput {
  source: string
  durationMs: number
}

export interface ClipBuffer {
  id: string
  source: string
  startedAt: number
}

export const buildClipBuffer = (input: ClipCaptureInput): ClipBuffer => {
  return {
    id: `clip-${Date.now()}`,
    source: input.source,
    startedAt: Date.now() - input.durationMs,
  }
}
