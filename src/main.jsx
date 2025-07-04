import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { Provider } from "react-redux";
import { store } from "./redux/store.js";
import { Toaster } from "react-hot-toast";
import { registerSW } from "virtual:pwa-register";

const rootElement = document.getElementById("root");

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <div className="min-h-screen w-screen overflow-hidden bg-darkbg text-white">
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1f1f1f",
              color: "#fff",
              border: "1px solid #333",
            },
          }}
        />
      </div>
    </Provider>
  </StrictMode>
);

// 🔄 PWA Service Worker Registration
registerSW({
  onNeedRefresh() {
    console.log("⚠️ New version of Notopia is available. Refresh to update.");
  },
  onOfflineReady() {
    console.log("✅ Notopia is ready for offline use.");
  },
});
