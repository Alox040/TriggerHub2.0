import { Component, type ErrorInfo, type ReactNode } from 'react'
import { createConsoleLogger, type Logger } from '../utils/logger'

interface RuntimeErrorBoundaryProps {
  children: ReactNode
}

interface RuntimeErrorBoundaryState {
  hasError: boolean
  message: string
}

const logger: Logger = createConsoleLogger('RuntimeErrorBoundary')

export class RuntimeErrorBoundary extends Component<
  RuntimeErrorBoundaryProps,
  RuntimeErrorBoundaryState
> {
  public constructor(props: RuntimeErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      message: '',
    }
  }

  public static getDerivedStateFromError(error: Error): RuntimeErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'Unexpected runtime error',
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('React runtime boundary caught an error', {
      error,
      componentStack: errorInfo.componentStack,
    })
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          className="th-ui-root"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--th-danger)',
          }}
        >
          {this.state.message}
        </div>
      )
    }

    return this.props.children
  }
}
