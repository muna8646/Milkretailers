import { useEffect, useState } from "react";

import Layout from "../../components/Layout";
import { getRetailerPayments } from "../../services/api";

export default function RetailerPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPayments() {
      try {
        const data = await getRetailerPayments();
        setPayments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadPayments();
  }, []);

  return (
    <Layout
      title="Weekly Payments"
      subtitle="Track milk recorded by each farmer and the payment due date in the 7-day cycle."
    >
      <div className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Payments</h2>
            <p>Farmers with recorded milk, days left in the weekly cycle, and outstanding amount.</p>
          </div>
        </div>

        {error && <div className="error-box">{error}</div>}

        <div className="table-container">
          {loading ? (
            <div className="loading">Loading weekly payments...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Farmer</th>
                  <th>First record</th>
                  <th>Last record</th>
                  <th>Days left</th>
                  <th>Amount due</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      No recorded milk needs payment yet.
                    </td>
                  </tr>
                ) : (
                  payments.map((item) => (
                    <tr key={item.farmer_id}>
                      <td>
                        <strong>{item.farmer_name}</strong>
                      </td>
                      <td>{new Date(item.first_collection_date).toLocaleDateString()}</td>
                      <td>{new Date(item.last_collection_date).toLocaleDateString()}</td>
                      <td>
                        <span className={`status ${item.days_remaining > 0 ? "active" : "inactive"}`}>
                          {item.days_remaining} day{item.days_remaining === 1 ? "" : "s"}
                        </span>
                      </td>
                      <td>
                        <strong>KSh {Number(item.outstanding_amount).toLocaleString()}</strong>
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
