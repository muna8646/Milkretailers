import { useEffect, useState } from "react";

import Layout from "../../components/Layout";

import {
  getAdminFarmers,
} from "../../services/api";

export default function Farmers() {
  const [farmers, setFarmers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadFarmers();
  }, []);

  async function loadFarmers() {
    try {
      const data =
        await getAdminFarmers();

      setFarmers(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout
      title="Farmers"
      subtitle="View farmers registered by your retailers."
    >
      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      <div className="table-container">
        {loading ? (
          <div className="loading">
            Loading farmers...
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Farmer</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Retailer</th>
                <th>Registered</th>
              </tr>
            </thead>

            <tbody>
              {farmers.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="empty-state"
                  >
                    No farmers registered yet.
                  </td>
                </tr>
              ) : (
                farmers.map(
                  (farmer) => (
                    <tr key={farmer.id}>
                      <td>
                        <strong>
                          {farmer.name}
                        </strong>
                      </td>

                      <td>
                        {farmer.phone ||
                          "—"}
                      </td>

                      <td>
                        {farmer.address ||
                          "—"}
                      </td>

                      <td>
                        {farmer.business_name}
                      </td>

                      <td>
                        {new Date(
                          farmer.created_at
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}