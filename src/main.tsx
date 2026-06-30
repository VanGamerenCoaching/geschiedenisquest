import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/global.css";
import { validateQuestionBank } from "./utils/validateQuestionBank";

if (import.meta.env.DEV) {
  validateQuestionBank({ log: true });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
