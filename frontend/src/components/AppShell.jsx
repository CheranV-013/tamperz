import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar.jsx";

const AppShell = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const showBack = location.pathname !== "/";

  return (
    <div className="min-h-screen bg-transparent px-6 pb-14 grid-dots">
      <div className="app-shell">
        <Navbar />
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          <aside className="panel p-4 h-fit sticky top-6">
            <div className="text-xs uppercase tracking-[0.25em] text-slate-400 mb-3">
              Navigation
            </div>
            <div className="flex flex-col gap-2">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `btn ${isActive ? "btn-primary" : "btn-ghost"} justify-start`
                }
              >
                Container & Data
              </NavLink>
              <NavLink
                to="/tracking"
                className={({ isActive }) =>
                  `btn ${isActive ? "btn-primary" : "btn-ghost"} justify-start`
                }
              >
                Live Location & Visitors
              </NavLink>
            </div>
          </aside>
          <main key={location.pathname} className="page-enter">
            {children}
          </main>
        </div>
      </div>

      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="floating-back btn btn-primary"
        >
          Back
        </button>
      )}
    </div>
  );
};

export default AppShell;
