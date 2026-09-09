import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-slate-900/90 border border-red-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 text-xl font-bold">
                ⚠️
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Dashboard Encountered an Error</h2>
                <p className="text-xs text-slate-400">MPLAD Rakshak Client Error</p>
              </div>
            </div>

            <div className="bg-black/50 rounded-lg p-3 font-mono text-xs text-red-300 border border-white/5 mb-4 overflow-x-auto max-h-48">
              {this.state.error?.toString()}
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium rounded-xl transition text-sm shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              Reload Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
