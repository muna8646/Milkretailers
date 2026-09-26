import { useEffect, useState } from "react";

import {
  Store,
  Activity,
  MemoryStick,
  Lock,
} from "lucide-react";

import Layout from "../../components/Layout";
import StatCard from "../../components/StatCard";

import {
  getAdminDashboard,
  changeAdminPassword,
} from "../../services/api";

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      const data = await getAdminDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    setPasswordMessage("");
    setPasswordError("");

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    try {
      await changeAdminPassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );

      setPasswordMessage("Password updated successfully.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setPasswordError(err.message);
    }
  }

  if (loading) {
    return (
      <Layout title="Dashboard" subtitle="Overview across all your retailers.">
        <div className="loading">Loading dashboard...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Dashboard" subtitle="Overview across all your retailers.">
        <div className="error-box">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard" subtitle="Overview across all your retailers.">
      <section className="stats-grid">
        <StatCard
          title="TOTAL RETAILERS"
          value={dashboard.retailers}
          description="All registered retailers"
          icon={<Store size={23} />}
        />

        <StatCard
          title="ACTIVE RETAILERS"
          value={dashboard.activeRetailers}
          description="Currently active"
          icon={<Activity size={23} />}
        />

        <StatCard
          title="RECENTLY ACTIVE"
          value={dashboard.recentRetailers?.length || 0}
          description="Latest active retailers"
          icon={<Store size={23} />}
        />

        <StatCard
          title="MEMORY USAGE"
          value={`${dashboard.memory?.heapUsed || 0} MB`}
          description={`Heap used: ${dashboard.memory?.heapUsed || 0} MB`}
          icon={<MemoryStick size={23} />}
        />
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Recently active retailers</h2>
            <p>Latest active retailer records in the system.</p>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Retailer Name</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Last Active</th>
              </tr>
            </thead>

            <tbody>
              {(dashboard.recentRetailers || []).length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    No active retailers found.
                  </td>
                </tr>
              ) : (
                (dashboard.recentRetailers || []).map((retailer) => (
                  <tr key={retailer.id}>
                    <td>
                      <strong>{retailer.business_name}</strong>
                    </td>
                    <td>{retailer.retailer_name || "—"}</td>
                    <td>{retailer.phone || "No phone"}</td>
                    <td>
                      <span className={`status ${retailer.is_active ? "active" : "inactive"}`}>
                        {retailer.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>{new Date(retailer.last_active).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Change admin password</h2>
            <p>Update your account password.</p>
          </div>
        </div>

        <div className="form-card compact-form">
          <form onSubmit={handlePasswordChange}>
            <div className="form-grid">
              <div className="form-group">
                <label>Current password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  placeholder="Current password"
                  required
                />
              </div>

              <div className="form-group">
                <label>New password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  placeholder="New password"
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  placeholder="Confirm password"
                  required
                />
              </div>
            </div>

            {passwordError && <div className="error-box">{passwordError}</div>}
            {passwordMessage && <div className="loading">{passwordMessage}</div>}

            <div className="form-actions">
              <button type="submit" className="primary-button">
                <Lock size={18} />
                Change password
              </button>
            </div>
          </form>
        </div>
      </section>
    </Layout>
  );
}