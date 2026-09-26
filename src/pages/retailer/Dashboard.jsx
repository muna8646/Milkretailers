import { useEffect, useState } from "react";
import { Users, Milk, Wallet, HandCoins } from "lucide-react";

import Layout from "../../components/Layout";
import StatCard from "../../components/StatCard";
import { useAuth } from "../../context/AuthContext";
import { getRetailerDashboard } from "../../services/api";

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState({
    farmers: 0,
    today: { litres: 0, amount: 0 },
    week: { litres: 0, amount: 0 },
    awaitingPayments: 0,
    totalPayments: 0,
    recentCollections: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await getRetailerDashboard();
        setDashboard(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <Layout
        title="Dashboard"
        subtitle={`Overview of your milk collection operations, ${user?.name || "Retailer"}.`}
      >
        <div className="loading">Loading dashboard...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout
        title="Dashboard"
        subtitle={`Overview of your milk collection operations, ${user?.name || "Retailer"}.`}
      >
        <div className="error-box">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Dashboard"
      subtitle={`Overview of your milk collection operations, ${user?.name || "Retailer"}.`}
    >
      <section className="stats-grid">
        <StatCard
          title="TOTAL FARMERS"
          value={dashboard.farmers}
          description="Active farmers"
          icon={<Users size={23} />}
        />

        <StatCard
          title="TODAY'S COLLECTION"
          value={`${dashboard.today.litres.toFixed(2)} L`}
          description={`KSh ${dashboard.today.amount.toLocaleString()}`}
          icon={<Milk size={23} />}
        />

        <StatCard
          title="THIS WEEK"
          value={`${dashboard.week.litres.toFixed(2)} L`}
          description={`KSh ${dashboard.week.amount.toLocaleString()}`}
          icon={<Wallet size={23} />}
        />

        <StatCard
          title="AWAITING PAYMENT"
          value={dashboard.awaitingPayments}
          description="farmers this week"
          icon={<HandCoins size={23} />}
        />
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Recent activity</h2>
            <p>Latest milk entries recorded for your farmers.</p>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Farmer</th>
                <th>Date</th>
                <th>Price/L</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {dashboard.recentCollections.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-state">
                    No recent activity yet.
                  </td>
                </tr>
              ) : (
                dashboard.recentCollections.map((collection) => (
                  <tr key={collection.id}>
                    <td>
                      <strong>{collection.farmer_name}</strong>
                    </td>
                    <td>
                      {new Date(collection.collection_date).toLocaleDateString()}
                    </td>
                    <td>KSh {Number(collection.price_per_litre).toLocaleString()}</td>
                    <td>
                      <strong>KSh {Number(collection.total_amount).toLocaleString()}</strong>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
}