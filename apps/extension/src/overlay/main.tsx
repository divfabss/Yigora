import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./overlay.css";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App sessionId={window.location.hash.slice(1)} />
    </StrictMode>,
  );
}
