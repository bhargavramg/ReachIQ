import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700 m-4">
          <h2 className="text-xl font-bold mb-2">Something went wrong.</h2>
          <p className="mb-4">The application encountered an unexpected error.</p>
          <pre className="bg-white p-4 rounded text-sm overflow-auto text-red-900 border border-red-100">
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
