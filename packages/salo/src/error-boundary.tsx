import { createContext, useContext, Component } from 'react'

interface ErrorBoundaryProps {
  fallback?: React.ReactNode
  children?: React.ReactNode
}

type ErrorBoundaryState =
  | { didCatch: true; error: unknown }
  | { didCatch: false; error: undefined }

const ErrorBoundaryContext = createContext<unknown>(undefined)
export const useCaughtError = () => useContext(ErrorBoundaryContext)

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)

    this.state = { didCatch: false, error: undefined }
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { didCatch: true, error }
  }

  render() {
    if (this.state.didCatch) {
      return (
        <ErrorBoundaryContext.Provider value={this.state.error}>
          {this.props.fallback}
        </ErrorBoundaryContext.Provider>
      )
    }

    return this.props.children
  }
}
