import Dashboard from "./pages/Dashboard.jsx";
import { useEffect } from "react";

const App = () => {

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/access-log`);
  }, []);

  return <Dashboard />;
};

export default App;