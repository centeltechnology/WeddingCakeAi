import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Conditional service worker registration - only in production
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    // Register service worker in production
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('ServiceWorker registration successful');
    }).catch(error => {
      console.log('ServiceWorker registration failed:', error);
    });
  } else {
    // Unregister any existing service workers in development
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister();
        console.log('ServiceWorker unregistered in development mode');
      });
    });
  }
}

createRoot(document.getElementById("root")!).render(<App />);
