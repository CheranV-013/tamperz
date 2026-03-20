import Dashboard from "./pages/Dashboard.jsx";
import { useEffect } from "react";

const App = () => {
  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE;

    // 🔥 Wake backend
    fetch(`${base}/api/health`)
      .then(() => console.log("Backend awake"))
      .catch(() => console.log("Backend waking..."));

    // 🔥 TRACK USER (IMPORTANT)
    fetch(`${base}/track`)
      .then(() => console.log("Visitor tracked"))
      .catch(() => console.log("Tracking failed"));

  }, []);

  return <Dashboard />;
};

export default App;