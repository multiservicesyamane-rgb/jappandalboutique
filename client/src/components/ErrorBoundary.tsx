import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw, RefreshCw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error.message);
    console.error("[ErrorBoundary] Stack:", errorInfo.componentStack);

    // Check if it's a DOM manipulation error (caused by browser extensions or third-party scripts)
    const isDomError =
      error.message.includes("removeChild") ||
      error.message.includes("insertBefore") ||
      error.message.includes("appendChild") ||
      error.message.includes("is not a child of this node") ||
      error.name === "NotFoundError" ||
      error.message.includes("Failed to execute");

    if (isDomError) {
      console.warn(
        "[ErrorBoundary] DOM manipulation error detected. " +
          "This is likely caused by a browser extension or third-party script. " +
          "Attempting auto-recovery..."
      );
      // Auto-recover from DOM errors by resetting state after a brief delay
      // This allows React to re-render without the problematic DOM state
      setTimeout(() => {
        this.setState({ hasError: false, error: null });
      }, 500);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-md p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle size={32} className="text-yellow-600" />
            </div>

            <h2 className="text-xl font-bold mb-2 text-foreground">
              Oups ! Un problème est survenu
            </h2>

            <p className="text-muted-foreground text-sm mb-6">
              Cette erreur peut être causée par une extension de navigateur ou un
              script tiers. Essayez de désactiver vos extensions ou de recharger
              la page.
            </p>

            <div className="flex gap-3">
              <button
                onClick={this.handleRetry}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium",
                  "bg-white border border-gray-300 text-gray-700",
                  "hover:bg-gray-50 cursor-pointer transition-colors"
                )}
              >
                <RefreshCw size={16} />
                Réessayer
              </button>
              <button
                onClick={() => window.location.reload()}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium",
                  "bg-primary text-primary-foreground",
                  "hover:opacity-90 cursor-pointer transition-colors"
                )}
              >
                <RotateCcw size={16} />
                Recharger la page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
