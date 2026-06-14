"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * React Error Boundary component.
 * Catches runtime errors in the component tree and displays a graceful fallback UI
 * instead of crashing the entire application. This is critical for production resilience.
 * 
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            role="alert"
            className="flex min-h-[200px] items-center justify-center rounded-sm border border-destructive/20 bg-destructive/5 p-8"
          >
            <div className="text-center">
              <p className="font-mono text-sm font-semibold text-destructive">
                MODULE ERROR
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                A rendering error occurred. Please refresh the page.
              </p>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="mt-4 rounded-sm border border-border bg-muted px-4 py-2 font-mono text-xs text-foreground transition-colors hover:bg-muted/80"
              >
                Retry
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
