import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override render() {
    if (this.state.error) {
      return (
        <main className="app-shell app-shell-start" style={{ justifyContent: "center", gap: "1.5rem" }}>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.1rem" }}>Что-то пошло не так</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            Перезапустить
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}
