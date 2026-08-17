import React from "react";
import "./ErrorBoundary.css";

class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { console.error("React render error:", error, info); }
  render() {
    if (this.state.hasError) return <main className="error-boundary" role="alert"><h1>Something went wrong</h1><p>The page hit an unexpected error. Your saved favorites are still safe.</p><div><button type="button" onClick={() => this.setState({ hasError: false })}>Try again</button><a href="/">Return to listings</a></div></main>;
    return this.props.children;
  }
}
export default ErrorBoundary;
