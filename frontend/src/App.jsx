import Dashboard from "./pages/Dashboard.jsx";
import { useEffect } from "react";
import socket from "./api/socketClient";

const App = () => {
  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE_URL;

    console.log("🌐 API:", base);

    socket.on("connect", () => {
      console.log("🔥 Socket ready → calling /track");

      fetch(`${base}/track`)
        .then(() => console.log("✅ Visitor tracked"))
        .catch(() => console.log("❌ Track failed"));
    });

  }, []);

  return <Dashboard />;
};

export default App;