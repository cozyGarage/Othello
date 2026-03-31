import { Component, type ReactNode, type ErrorInfo } from 'react';
import { isDebugMode } from '../../config/features';

interface ErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (isDebugMode()) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" role="alert">
          <div className="error-boundary-content">
            <h2>Something went wrong</h2>
            <p>The game encountered an unexpected error.</p>
            {isDebugMode() && this.state.error && (
              <pre className="error-boundary-details">{this.state.error.message}</pre>
            )}
            <button className="action-bar-btn primary" onClick={this.handleReset}>
              <span className="btn-icon">🔄</span>
              <span className="btn-text">Reset Game</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
