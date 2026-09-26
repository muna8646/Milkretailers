import { useEffect, useState } from "react";
import { Save } from "lucide-react";

import Layout from "../../components/Layout";
import { createCollection, getRetailerCollections, getRetailerFarmers } from "../../services/api";
import { showToast } from "../../utils/toast";

const defaultForm = {
  farmerId: "",
  litres: "",
  pricePerLitre: "",
  collectionDate: new Date().toISOString().slice(0, 10),
};

export default function RetailerMilkCollection() {
  const [farmers, setFarmers] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [farmerData, collectionData] = await Promise.all([
        getRetailerFarmers(),
        getRetailerCollections(),
      ]);

      setFarmers(farmerData);
      setCollections(collectionData);
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
      await createCollection(form);
      setForm(defaultForm);
      await loadData();
      showToast("Milk collection recorded successfully", "success");
    } catch (error) {
      setError(error.message);
      showToast(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout
      title="Milk Collection"
      subtitle="Record daily milk entries from your farmers."
    >
      <div className="dashboard-section" style={{ marginBottom: "24px" }}>
        <div className="section-header">
          <div>
            <h2>Record collection</h2>
            <p>Log milk delivered by a farmer.</p>
          </div>
        </div>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit} className="form-card compact-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Farmer</label>
              <select
                value={form.farmerId}
                onChange={(e) => setForm({ ...form, farmerId: e.target.value })}
                required
              >
                <option value="">Select farmer</option>
                {farmers.map((farmer) => (
                  <option key={farmer.id} value={farmer.id}>
                    {farmer.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={form.collectionDate}
                onChange={(e) => setForm({ ...form, collectionDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Litres</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.litres}
                onChange={(e) => setForm({ ...form, litres: e.target.value })}
                placeholder="18.50"
                required
              />
            </div>

            <div className="form-group">
              <label>Price per litre</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.pricePerLitre}
                onChange={(e) => setForm({ ...form, pricePerLitre: e.target.value })}
                placeholder="42.00"
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={saving}>
              <Save size={18} />
              {saving ? "Saving..." : "Record collection"}
            </button>
          </div>
        </form>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Collection records</h2>
            <p>Latest records submitted for your farm network.</p>
          </div>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="loading">Loading records...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Farmer</th>
                  <th>Litres</th>
                  <th>Rate</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {collections.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      No milk collections recorded yet.
                    </td>
                  </tr>
                ) : (
                  collections.map((item) => (
                    <tr key={item.id}>
                      <td>{new Date(item.collection_date).toLocaleDateString()}</td>
                      <td>
                        <strong>{item.farmer_name}</strong>
                      </td>
                      <td>{Number(item.litres).toFixed(2)} L</td>
                      <td>KSh {Number(item.price_per_litre).toLocaleString()}</td>
                      <td>
                        <strong>KSh {Number(item.total_amount).toLocaleString()}</strong>
                      </td>
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
