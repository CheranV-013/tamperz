import Dashboard from "./pages/Dashboard.jsx";
import { useEffect } from "react";

const App = () => {
  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE_URL;

    console.log("🌐 API:", base);

    // 🔥 CALL TRACK IMMEDIATELY (IMPORTANT)
    fetch(`${base}/track`)
      .then(() => console.log("✅ Visitor tracked"))
      .catch(() => console.log("❌ Track failed"));

  }, []);

  return <Dashboard />;
};

export default App;