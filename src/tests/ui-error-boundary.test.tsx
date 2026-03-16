// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ErrorBoundary } from '../ui/components'

class BoomError extends Error {
  public constructor() {
    super('boom')
    this.name = 'BoomError'
  }
}

const ThrowingChild = (): JSX.Element => {
  throw new BoomError()
}

describe('ErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the provided fallback when a child throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    render(
      <ErrorBoundary fallback={<div>Fallback aktiv</div>}>
        <ThrowingChild />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Fallback aktiv')).toBeTruthy()
  })
})
