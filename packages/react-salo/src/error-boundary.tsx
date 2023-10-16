import { createContext, useContext, Component } from 'react'

export interface ErrorBoundaryProps {
  fallback?: React.ReactNode
  children?: React.ReactNode
}

type ErrorBoundaryState =
  | { didCatch: true; error: unknown }
  | { didCatch: false; error: undefined }

const ErrorBoundaryContext = createContext<
  [error: unknown, recover: () => void] | null
>(null)

export const useCaughtError = () => {
  const value = useContext(ErrorBoundaryContext)

  if (value === null)
    throw new Error('`useCaughtError` hook must be used inside `ErrorBoundary`')

  return value
}

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

  recover = () => {
    this.setState({ didCatch: false, error: undefined })
  }

  render() {
    if (this.state.didCatch) {
      return (
        <ErrorBoundaryContext.Provider value={[this.state.error, this.recover]}>
          {this.props.fallback}
        </ErrorBoundaryContext.Provider>
      )
    }

    return this.props.children
  }
}
