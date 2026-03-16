import React from 'react'

interface ErrorBoundaryProps {
  fallback?: React.ReactNode
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  public override render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? 'Dieser Bereich konnte nicht geladen werden.'
    }

    return this.props.children
  }
}
