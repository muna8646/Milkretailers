import { useState } from "react";
import { Lock } from "lucide-react";

import Layout from "../../components/Layout";
import { changeRetailerPassword } from "../../services/api";

export default function RetailerSettings() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError("Please fill in all password fields.");
      return;
    }

    if (form.newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    try {
      await changeRetailerPassword(form.currentPassword, form.newPassword);
      setMessage("Password updated successfully.");
      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err.message || "Unable to update password.");
    }
  }

  return (
    <Layout title="Settings" subtitle="Manage your retailer account settings.">
      <div className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Change password</h2>
            <p>Update your account password securely.</p>
          </div>
        </div>

        <div className="form-card compact-form">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Current password</label>
                <input
                  type="password"
                  value={form.currentPassword}
                  onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                  placeholder="Current password"
                  required
                />
              </div>

              <div className="form-group">
                <label>New password</label>
                <input
                  type="password"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  placeholder="New password"
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm password</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Confirm password"
                  required
                />
              </div>
            </div>

            {error && <div className="error-box">{error}</div>}
            {message && <div className="loading">{message}</div>}

            <div className="form-actions">
              <button type="submit" className="primary-button">
                <Lock size={18} />
                Change password
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
