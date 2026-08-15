import { createRoot } from "react-dom/client";
import { AppProvider } from "./context/AppContext.jsx";
import AppShell from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <AppProvider>
    <AppShell />
  </AppProvider>
);
