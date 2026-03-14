export class HttpRequestError extends Error {
  public constructor(
    public readonly method: string,
    public readonly url: string,
    public readonly status: number,
    public readonly responseBody: string,
  ) {
    super(`HTTP ${method} ${url} failed with status ${status}`)
  }
}

export class ResponseValidationError extends Error {
  public constructor(
    public readonly method: string,
    public readonly url: string,
    public readonly reason: string,
    public readonly payload: unknown,
  ) {
    super(`Response validation failed for ${method} ${url}: ${reason}`)
  }
}

export interface HttpClientOptions {
  baseUrl: string
  fetchImpl?: typeof fetch
  headers?: Record<string, string>
}

export class HttpClient {
  private readonly fetchImpl: typeof fetch

  public constructor(private readonly options: HttpClientOptions) {
    this.fetchImpl = options.fetchImpl ?? fetch
  }

  public async get<TResponse>(
    path: string,
    validate?: (value: unknown) => value is TResponse,
  ): Promise<TResponse> {
    const url = `${this.options.baseUrl}${path}`

    const response = await this.fetchImpl(url, {
      method: 'GET',
      headers: this.options.headers,
    })

    return this.handleResponse('GET', url, response, validate)
  }

  public async post<TResponse>(
    path: string,
    body?: unknown,
    validate?: (value: unknown) => value is TResponse,
  ): Promise<TResponse> {
    const url = `${this.options.baseUrl}${path}`

    const response = await this.fetchImpl(url, {
      method: 'POST',
      headers: {
        ...(this.options.headers ?? {}),
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    return this.handleResponse('POST', url, response, validate)
  }

  private async handleResponse<TResponse>(
    method: 'GET' | 'POST',
    url: string,
    response: Response,
    validate?: (value: unknown) => value is TResponse,
  ): Promise<TResponse> {
    if (!response.ok) {
      const responseBody = await response.text()
      throw new HttpRequestError(method, url, response.status, responseBody)
    }

    if (response.status === 204) {
      return undefined as TResponse
    }

    const text = await response.text()
    if (!text) {
      return undefined as TResponse
    }

    const parsed = JSON.parse(text) as unknown

    if (validate && !validate(parsed)) {
      throw new ResponseValidationError(method, url, 'payload does not match expected schema', parsed)
    }

    return parsed as TResponse
  }
}
