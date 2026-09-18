import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-charcoal text-ivory flex items-center justify-center p-6">
          <div className="max-w-md w-full border border-copper/30 bg-charcoal-2/80 p-8 text-center space-y-6 shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-full bg-copper/10 border border-copper/40 flex items-center justify-center text-copper text-xl">
              !
            </div>
            <div>
              <div className="text-copper text-xs tracking-[0.3em] uppercase mb-2">
                Notice
              </div>
              <h2 className="text-xl font-display font-light text-ivory mb-2">
                Unable to load this view
              </h2>
              <p className="text-xs text-ivory/60 font-light leading-relaxed">
                A temporary error occurred while rendering this page. You can retry loading or return to the previous page.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="btn-primary text-xs tracking-[0.2em] uppercase py-2.5 px-6"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={() => (window.location.href = "/admin/properties")}
                className="btn-outline text-xs tracking-[0.2em] uppercase py-2.5 px-6"
              >
                Back to Properties
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
