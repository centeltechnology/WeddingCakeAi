import { createRoot } from "react-dom/client";

// Test without CSS import first
function TestApp() {
  return (
    <div>
      <h1>Bakewise Preview Test</h1>
      <p>Testing if React renders at all...</p>
    </div>
  );
}

// Very basic mount test
const rootElement = document.getElementById("root");
console.log("Root element:", rootElement);

if (rootElement) {
  console.log("Creating React root...");
  const root = createRoot(rootElement);
  console.log("Rendering app...");
  root.render(<TestApp />);
  console.log("App should be rendered");
} else {
  console.error("No root element found!");
}