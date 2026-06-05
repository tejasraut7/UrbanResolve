import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../lib/api.js";

export default function RegisterAdmin() {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    inviteSecret: "",
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/auth/register", formData);
      toast.success("Account created. You can sign in now.");
      navigate("/login");
      setFormData({ userName: "", email: "", password: "", inviteSecret: "" });
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Registration failed. Check your invite secret and try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container auth-shell">
      <div className="card auth-card">
        <div className="card-inner">
          <h1 className="h1">Admin registration</h1>
          <p className="subhead">
            Create an administrator account to manage and resolve complaints.
          </p>

          <form onSubmit={handleSubmit} style={{ marginTop: 14 }}>
            <div className="field">
              <label className="label" htmlFor="reg-name">
                Name
              </label>
              <input
                id="reg-name"
                className="control"
                type="text"
                placeholder="Enter your name"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                autoComplete="name"
                required
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="reg-email">
                Email
              </label>
              <input
                id="reg-email"
                className="control"
                type="email"
                placeholder="admin@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                autoComplete="email"
                required
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="reg-password">
                Password
              </label>
              <input
                id="reg-password"
                className="control"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="reg-invite">
                Invite secret
              </label>
              <input
                id="reg-invite"
                className="control"
                type="password"
                placeholder="Invitation code from your organisation"
                value={formData.inviteSecret}
                onChange={(e) => setFormData({ ...formData, inviteSecret: e.target.value })}
                autoComplete="off"
                required
              />
            </div>

            <div className="actions">
              <button className="btn primary" type="submit" disabled={loading}>
                {loading ? "Creating…" : "Create admin"}
              </button>
              <Link className="btn" to="/login">
                Already have an account?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
