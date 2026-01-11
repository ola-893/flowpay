import React, { Component } from 'react';
import { AlertTriangle, Wrench, RefreshCw, Inbox, Link, Wifi } from 'lucide-react';

// Error Boundary Component
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
          variant={this.props.variant}
        />
      );
    }

    return this.props.children;
  }
}

// Error Fallback Component
export function ErrorFallback({ error, onRetry, variant = 'default' }) {
  const variants = {
    default: {
      container: 'card-glass p-6 md:p-8',
      Icon: AlertTriangle,
      title: 'Something went wrong',
    },
    inline: {
      container: 'p-4 rounded-xl bg-error-500/10 border border-error-500/20',
      Icon: AlertTriangle,
      title: 'Error loading content',
    },
    fullscreen: {
      container: 'min-h-[50vh] flex items-center justify-center',
      Icon: Wrench,
      title: 'Oops! Something broke',
    },
  };

  const config = variants[variant] || variants.default;
  const IconComponent = config.Icon;

  return (
    <div className={config.container}>
      <div className={`text-center ${variant === 'fullscreen' ? 'max-w-md mx-auto' : ''}`}>
        <div className="flex justify-center mb-4">
          <IconComponent className="w-12 h-12 text-warning-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{config.title}</h3>
        <p className="text-sm text-white/60 mb-4">
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button
            onClick={onRetry}
            className="btn-primary min-h-[44px] touch-manipulation flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="btn-outline min-h-[44px] touch-manipulation"
          >
            Refresh Page
          </button>
        </div>

        {/* Error details (collapsible in development) */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-4 text-left">
            <summary className="text-xs text-white/40 cursor-pointer hover:text-white/60">
              Technical Details
            </summary>
            <pre className="mt-2 p-3 rounded-lg bg-surface-800 text-xs text-error-400 overflow-auto max-h-40">
              {error.stack || error.toString()}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

// Empty State Component
export function EmptyState({ 
  icon: IconComponent = Inbox, 
  title = 'No data', 
  subtitle = 'Nothing to display here yet',
  action,
  className = ''
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 md:py-16 text-center ${className}`}>
      <div className="flex justify-center mb-4">
        <IconComponent className="w-12 h-12 md:w-16 md:h-16 text-white/40" />
      </div>
      <h3 className="text-lg font-semibold text-white/80">{title}</h3>
      <p className="text-sm text-white/50 mt-1 max-w-xs">{subtitle}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="btn-primary mt-6 min-h-[44px] touch-manipulation flex items-center gap-2"
        >
          {action.icon && action.icon}
          {action.label}
        </button>
      )}
    </div>
  );
}

// Loading State Component
export function LoadingState({ message = 'Loading...', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 md:py-16 ${className}`}>
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-flowpay-500/20" />
        <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-t-flowpay-500 animate-spin" />
      </div>
      <p className="text-sm text-white/60 mt-4">{message}</p>
    </div>
  );
}

// Connection Error Component
export function ConnectionError({ onRetry, className = '' }) {
  return (
    <div className={`card-glass p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <Wifi className="w-8 h-8 text-white/60" />
        <div className="flex-1">
          <h3 className="font-semibold text-white">Connection Lost</h3>
          <p className="text-sm text-white/60 mt-1">
            Unable to connect to the network. Please check your connection and try again.
          </p>
          <button
            onClick={onRetry}
            className="btn-outline mt-4 min-h-[44px] touch-manipulation flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Reconnect
          </button>
        </div>
      </div>
    </div>
  );
}

// Wallet Not Connected State
export function WalletNotConnected({ onConnect, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 md:py-16 text-center ${className}`}>
      <div className="flex justify-center mb-4">
        <Link className="w-12 h-12 md:w-16 md:h-16 text-white/40" />
      </div>
      <h3 className="text-lg font-semibold text-white/80">Wallet Not Connected</h3>
      <p className="text-sm text-white/50 mt-1 max-w-xs">
        Connect your wallet to view and manage your streams
      </p>
      <button
        onClick={onConnect}
        className="btn-primary mt-6 min-h-[44px] touch-manipulation"
      >
        Connect Wallet
      </button>
    </div>
  );
}

// Network Mismatch State
export function NetworkMismatch({ expectedNetwork, onSwitch, className = '' }) {
  return (
    <div className={`card-glass p-6 border-warning-500/30 ${className}`}>
      <div className="flex items-start gap-4">
        <AlertTriangle className="w-8 h-8 text-warning-400" />
        <div className="flex-1">
          <h3 className="font-semibold text-warning-400">Wrong Network</h3>
          <p className="text-sm text-white/60 mt-1">
            Please switch to {expectedNetwork} to use FlowPay
          </p>
          <button
            onClick={onSwitch}
            className="btn-primary mt-4 min-h-[44px] touch-manipulation"
          >
            Switch Network
          </button>
        </div>
      </div>
    </div>
  );
}
