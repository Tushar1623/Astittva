import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  resetError = (destination) => {
    this.setState({ hasError: false, error: null });
    if (destination) {
      window.location.href = destination;
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      const isAdmin =
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/admin");

      return (
        <div className="min-h-screen bg-[#FAF8F5] text-[#1C1C1C] flex items-center justify-center p-6">
          <div className="max-w-lg w-full border border-[#E8DED2] bg-white p-8 text-center space-y-6 shadow-2xl rounded-xl">
            <div className="w-12 h-12 mx-auto rounded-full bg-copper/15 border border-copper/40 flex items-center justify-center text-copper text-xl font-bold">
              !
            </div>

            <div>
              <div className="text-copper text-xs tracking-[0.3em] uppercase mb-2 font-semibold">
                Notice
              </div>
              <h2 className="text-2xl font-serif-display font-medium text-[#1C1C1C] mb-2">
                Unable to load this view
              </h2>
              <p className="text-xs text-[#5F5F5F] font-light leading-relaxed max-w-sm mx-auto">
                A temporary error occurred while rendering this page. You can retry loading or return to a previous section.
              </p>
            </div>

            {/* Error diagnostics collapsible */}
            <div className="text-left bg-black/40 border border-copper/20 rounded-[6px] p-4 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[#5F5F5F]">
                <span className="font-semibold text-copper tracking-wider uppercase">Diagnostic Log</span>
                <button
                  type="button"
                  onClick={() => this.setState((s) => ({ showDetails: !s.showDetails }))}
                  className="text-copper hover:underline text-[10px] uppercase tracking-wider"
                >
                  {this.state.showDetails ? "Hide Stack" : "Show Stack"}
                </button>
              </div>

              <div className="font-bold text-red-500 break-words">
                {this.state.error?.name || "Error"}: {this.state.error?.message || "Unknown rendering exception"}
              </div>

              {this.state.showDetails && this.state.error?.stack && (
                <div className="text-[11px] text-[#8C827A] whitespace-pre-wrap leading-tight max-h-48 overflow-auto pt-2 border-t border-copper/15">
                  {this.state.error.stack.split("\n").slice(0, 8).join("\n")}
                </div>
              )}
            </div>

            {/* Navigation & Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => this.resetError()}
                className="btn-primary text-xs tracking-[0.2em] uppercase py-2.5 px-6 cursor-pointer"
              >
                Retry
              </button>

              {isAdmin ? (
                <>
                  <button
                    type="button"
                    onClick={() => this.resetError("/admin")}
                    className="btn-outline text-xs tracking-[0.2em] uppercase py-2.5 px-6 cursor-pointer"
                  >
                    Admin Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => this.resetError("/admin/properties")}
                    className="btn-outline text-xs tracking-[0.2em] uppercase py-2.5 px-6 cursor-pointer"
                  >
                    Properties
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => this.resetError("/")}
                    className="btn-outline text-xs tracking-[0.2em] uppercase py-2.5 px-6 cursor-pointer"
                  >
                    Home
                  </button>
                  <button
                    type="button"
                    onClick={() => this.resetError("/properties")}
                    className="btn-outline text-xs tracking-[0.2em] uppercase py-2.5 px-6 cursor-pointer"
                  >
                    Properties
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
