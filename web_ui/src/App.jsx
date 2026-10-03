import React from 'react';
import Desktop from './components/Desktop';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500 bg-black h-screen">
          <h1>Something went wrong.</h1>
          <pre>{this.state.error.toString()}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

import { UserProvider } from './contexts/UserContext';

function App() {
  return (
    <UserProvider>
      <ErrorBoundary>
        <Desktop />
      </ErrorBoundary>
    </UserProvider>
  );
}

export default App;

