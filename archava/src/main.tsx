import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@livekit/components-styles";
import "./widget.css";

ReactDOM.createRoot((document.getElementById("archava-widget-root") || document.getElementById("root"))!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
