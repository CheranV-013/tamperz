import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Tracking from "./pages/Tracking.jsx";
import AppShell from "./components/AppShell.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tracking" element={<Tracking />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
};

export default App;
