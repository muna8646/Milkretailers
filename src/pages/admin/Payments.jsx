import { useEffect, useState } from "react";

import Layout from "../../components/Layout";
import { getAdminPayments } from "../../services/api";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  async function loadPayments() {
    try {
      const data = await getAdminPayments();
      setPayments(data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout
      title="Weekly Payments"
      subtitle="View payments made to farmers."
    >
      <div className="table-container">
        {loading ? (
          <div className="loading">Loading payments...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Farmer</th>
                <th>Retailer</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Reference</th>
              </tr>
            </thead>

            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    No payments recorded yet.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </td>

                    <td>
                      <strong>{payment.farmer_name}</strong>
                    </td>

                    <td>{payment.business_name}</td>

                    <td>
                      <strong>
                        KSh {Number(payment.amount).toLocaleString()}
                      </strong>
                    </td>

                    <td>
                      <span className="status active">
                        {payment.payment_method}
                      </span>
                    </td>

                    <td>{payment.reference || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}