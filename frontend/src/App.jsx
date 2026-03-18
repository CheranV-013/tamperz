import Dashboard from "./pages/Dashboard.jsx";

const App = () => {
  return <Dashboard />;
};
useEffect(() => {
  fetch(`${import.meta.env.VITE_API_BASE_URL}/api/access-log`);
}, []);

export default App;
