export interface ObsApiResponse {
  success: true
}

export interface ObsSetSceneRequest {
  sceneName: string
}

export const isObsApiResponse = (value: unknown): value is ObsApiResponse => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>
  return candidate.success === true
}
