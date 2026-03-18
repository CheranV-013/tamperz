import Dashboard from "./pages/Dashboard.jsx";
import { useEffect } from "react";

const App = () => {

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE_URL;

    // 🔥 1. Wake backend (VERY IMPORTANT for Render)
    fetch(`${base}/api/health`)
      .then(() => console.log("Backend awake"))
      .catch(() => console.log("Backend waking..."));

    // 🔥 2. Log access (your cyber feature)
    fetch(`${base}/api/access-log`)
      .then(() => console.log("Access logged"))
      .catch(() => console.log("Access log failed"));

  }, []);

  return <Dashboard />;
};

export default App;