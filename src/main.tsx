import React from "react";
import ReactDOM from "react-dom/client";
import { registerGlobalAudioUnlock } from "./lib/audioUnlock";
import "./styles.css";

registerGlobalAudioUnlock();

async function bootstrap() {
  const root = document.getElementById("root")!;
  if (import.meta.env.DEV && /\/editor\/?$/.test(window.location.pathname)) {
    const { RoundEditorApp } = await import("./editor/RoundEditorApp");
    await import("./editor/editor.css");
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <RoundEditorApp />
      </React.StrictMode>,
    );
  } else {
    const { default: App } = await import("./App");
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  }
}

void bootstrap();
