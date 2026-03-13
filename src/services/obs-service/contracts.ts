export interface ObsApiResponse {
  success: true
}

export interface ObsSetSceneRequest {
  sceneName: string
}

export class ObsSceneValidationError extends Error {
  public constructor(message: string) {
    super(message)
    this.name = 'ObsSceneValidationError'
  }
}

export const normalizeObsSceneName = (sceneName: string): string => {
  const normalized = sceneName.trim()
  if (normalized.length === 0) {
    throw new ObsSceneValidationError('OBS scene name must not be empty')
  }

  return normalized
}

export const isObsApiResponse = (value: unknown): value is ObsApiResponse => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>
  return candidate.success === true
}
