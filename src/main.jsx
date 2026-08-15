import { createRoot } from "react-dom/client";
import "./index.css";
import { AppProvider } from "./context/AppContext.jsx";
import AppShell from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <AppProvider>
    <AppShell />
  </AppProvider>
);
