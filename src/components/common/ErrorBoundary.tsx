import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full min-h-[400px] flex items-center justify-center p-6 bg-[#F7F7F7] dark:bg-[#101010] text-[#101010] dark:text-white">
          <div className="max-w-md w-full bg-white dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333] rounded-2xl p-6 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#FF7900]/15 text-[#FF7900] flex items-center justify-center mx-auto border border-[#FF7900]/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#101010] dark:text-white">
              {this.props.fallbackTitle || 'Something went wrong'}
            </h3>
            <p className="text-xs text-[#555555] dark:text-[#A3A3A3]">
              An unexpected issue occurred while rendering this view. You can reload to restore the standard state.
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#E50914] hover:bg-[#b80710] text-white rounded-xl text-xs font-semibold shadow-md transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
