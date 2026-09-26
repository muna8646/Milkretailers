import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import Layout from "../../components/Layout";
import { createFarmer, getRetailerFarmers } from "../../services/api";
import { showToast } from "../../utils/toast";

const defaultForm = {
  name: "",
  phone: "",
  address: "",
};

export default function RetailerFarmers() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadFarmers();
  }, []);

  async function loadFarmers() {
    try {
      const data = await getRetailerFarmers();
      setFarmers(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await createFarmer(form);
      setForm(defaultForm);
      await loadFarmers();
      showToast("Farmer registered successfully", "success");
    } catch (error) {
      setError(error.message);
      showToast(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout
      title="Farmers"
      subtitle="Register and manage the farmers under your retailer account."
    >
      <div className="dashboard-section" style={{ marginBottom: "24px" }}>
        <div className="section-header">
          <div>
            <h2>Register farmer</h2>
            <p>Add a new farmer to your collection network.</p>
          </div>
        </div>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit} className="form-card compact-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Farmer name</label>
              <input
                name="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. John Wanjiku"
                required
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="0712 345 678"
              />
            </div>

            <div className="form-group full">
              <label>Address</label>
              <input
                name="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Farm location or village"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={saving}>
              <Plus size={18} />
              {saving ? "Saving..." : "Register farmer"}
            </button>
          </div>
        </form>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Farmer list</h2>
            <p>Manage all registered farmers.</p>
          </div>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="loading">Loading farmers...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {farmers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty-state">
                      No farmers registered yet.
                    </td>
                  </tr>
                ) : (
                  farmers.map((farmer) => (
                    <tr key={farmer.id}>
                      <td>
                        <strong>{farmer.name}</strong>
                      </td>
                      <td>{farmer.phone || "—"}</td>
                      <td>{farmer.address || "—"}</td>
                      <td>{new Date(farmer.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}
