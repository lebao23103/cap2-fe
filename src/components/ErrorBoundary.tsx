import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Home, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // TODO: Send error to error tracking service (e.g., Sentry) in production
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  toggleDetails = () => {
    this.setState((prevState) => ({
      showDetails: !prevState.showDetails,
    }));
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-2xl w-full border-0 shadow-xl bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4 pb-6">
              {/* Error Icon with Glow */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full" />
                  <div className="relative p-6 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20">
                    <AlertTriangle className="h-16 w-16 text-red-500" strokeWidth={1.5} />
                  </div>
                </div>
              </div>

              <div>
                <CardTitle className="text-2xl font-bold mb-2">
                  Oops! Something went wrong
                </CardTitle>
                <p className="text-muted-foreground">
                  We encountered an unexpected error. Don't worry, our team has been notified.
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error Message */}
              {this.state.error && (
                <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-4">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    {this.state.error.message || 'An unknown error occurred'}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleReset}
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-primary to-secondary text-white shadow-md hover:shadow-lg"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  size="lg"
                  className="flex-1"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </div>

              {/* Technical Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="space-y-3">
                  <button
                    onClick={this.toggleDetails}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {this.state.showDetails ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Hide Technical Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Show Technical Details
                      </>
                    )}
                  </button>

                  {this.state.showDetails && (
                    <div className="rounded-lg bg-muted/50 border border-border p-4 space-y-4">
                      {/* Error Stack */}
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Error Stack:</h4>
                        <pre className="text-xs overflow-x-auto bg-background/50 p-3 rounded border border-border">
                          {this.state.error.stack}
                        </pre>
                      </div>

                      {/* Component Stack */}
                      {this.state.errorInfo && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Component Stack:</h4>
                          <pre className="text-xs overflow-x-auto bg-background/50 p-3 rounded border border-border">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Help Text */}
              <div className="text-center text-sm text-muted-foreground">
                <p>
                  If this problem persists, please{' '}
                  <a href="/contact" className="text-primary hover:underline">
                    contact support
                  </a>
                  .
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
