import { useEffect, useState } from "react";

import Layout from "../../components/Layout";
import { getRetailers } from "../../services/api";

export default function Reports() {
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRetailers() {
      try {
        const data = await getRetailers();
        setRetailers(data.filter((retailer) => retailer.is_active));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadRetailers();
  }, []);

  return (
    <Layout
      title="Retailer Report"
      subtitle="Active retailers currently in the system."
    >
      <div className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Active Retailers</h2>
            <p>Only retailers with an active status are shown here.</p>
          </div>
        </div>

        {error && <div className="error-box">{error}</div>}

        <div className="table-container">
          {loading ? (
            <div className="loading">Loading active retailers...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Farmers</th>
                  <th>Milk</th>
                </tr>
              </thead>
              <tbody>
                {retailers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      No active retailers found.
                    </td>
                  </tr>
                ) : (
                  retailers.map((retailer) => (
                    <tr key={retailer.id}>
                      <td>
                        <strong>{retailer.business_name}</strong>
                        <small>{retailer.name}</small>
                      </td>

                      <td>
                        {retailer.email}
                        <small>{retailer.phone || "No phone"}</small>
                      </td>

                      <td>
                        <span className="status active">Active</span>
                      </td>

                      <td>{retailer.farmer_count}</td>

                      <td>{Number(retailer.total_litres).toFixed(2)} L</td>
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
