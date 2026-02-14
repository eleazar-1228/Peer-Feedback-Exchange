import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    console.error("Error boundary caught error:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error details:", error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "600px" }}>
          <h1 style={{ color: "#b91c1c" }}>Something went wrong</h1>
          <pre style={{ background: "#fef2f2", padding: "1rem", overflow: "auto" }}>
            {this.state.error.message}
          </pre>
          <p style={{ color: "#666" }}>Check the browser console for more details.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <AppErrorBoundary>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AppErrorBoundary>
);
