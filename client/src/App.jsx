import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import UserDashboard from "./pages/UserDashboard";
import LoginForm from "./components/LoginForm.jsx";
import AdminDashboard from "./pages/AdminDashboard";
import RegisterAdmin from "./components/RegisterForm.jsx";

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="topbar">
          <div className="topbar-inner">
            <div className="brand">
              <div className="brand-badge" aria-hidden="true" />
              <span>Smart Urban Grievance</span>
            </div>

            <nav className="topbar-links">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `navlink ${isActive ? "active" : ""}`
                }
              >
                Citizen
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `navlink ${isActive ? "active" : ""}`
                }
              >
                Admin register
              </NavLink>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `navlink ${isActive ? "active" : ""}`
                }
              >
                Admin login
              </NavLink>
            </nav>
          </div>
        </header>

        <main className="page">
          <Routes>
            <Route path="/" element={<UserDashboard />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/register" element={<RegisterAdmin />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;