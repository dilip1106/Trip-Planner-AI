import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import BackendClientProvider from "@/context//BackendClientProvider";
import { ThemeProvider } from "@/context/ThemeProvider"; // Adjust path if needed

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <BackendClientProvider>
        <App />
      </BackendClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);
