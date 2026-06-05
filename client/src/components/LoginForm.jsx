import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../lib/api.js";

export default function LoginForm() {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      loginData.email.trim().length > 3 &&
      loginData.password.trim().length > 7 &&
      !loading
    );
  }, [loginData.email, loginData.password, loading]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", loginData);
      localStorage.setItem("token", res.data.token);
      toast.success("Signed in successfully.");
      navigate("/admin");
      setLoginData({ email: "", password: "" });
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        (error?.response?.status === 401
          ? "Invalid email or password."
          : "Login failed. Please try again.");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container auth-shell">
      <div className="card auth-card">
        <div className="card-inner">
          <h1 className="h1">Admin login</h1>
          <p className="subhead">
            Access the municipal dashboard to triage and resolve complaints.
          </p>

          <form onSubmit={handleSubmit} style={{ marginTop: 14 }}>
            <div className="field">
              <label className="label" htmlFor="login-email">
                Email
              </label>
              <input
                id="login-email"
                className="control"
                type="email"
                placeholder="admin@email.com"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                autoComplete="email"
                required
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="login-password">
                Password
              </label>
              <input
                id="login-password"
                className="control"
                type="password"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                autoComplete="current-password"
                required
              />
            </div>

            <div className="actions">
              <button className="btn primary" type="submit" disabled={!canSubmit}>
                {loading ? "Signing in…" : "Sign in"}
              </button>
              <Link className="btn" to="/register">
                Create admin account
              </Link>
            </div>

            <div className="helper">
              Tip: if you’re not an admin, use the Citizen screen to submit and track complaints.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
