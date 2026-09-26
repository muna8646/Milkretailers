import { useEffect, useState } from "react";

import Layout from "../../components/Layout";

import {
  getAdminCollections,
} from "../../services/api";

export default function MilkCollection() {
  const [collections, setCollections] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadCollections();
  }, []);

  async function loadCollections() {
    try {
      const data =
        await getAdminCollections();

      setCollections(data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout
      title="Milk Collection"
      subtitle="View milk collected across all retailers."
    >
      <div className="table-container">
        {loading ? (
          <div className="loading">
            Loading collections...
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Farmer</th>
                <th>Retailer</th>
                <th>Litres</th>
                <th>Price/L</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {collections.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="empty-state"
                  >
                    No collections recorded yet.
                  </td>
                </tr>
              ) : (
                collections.map(
                  (item) => (
                    <tr key={item.id}>
                      <td>
                        {new Date(
                          item.collection_date
                        ).toLocaleDateString()}
                      </td>

                      <td>
                        <strong>
                          {item.farmer_name}
                        </strong>
                      </td>

                      <td>
                        {item.business_name}
                      </td>

                      <td>
                        {Number(
                          item.litres
                        ).toFixed(2)}{" "}
                        L
                      </td>

                      <td>
                        KSh{" "}
                        {Number(
                          item.price_per_litre
                        ).toLocaleString()}
                      </td>

                      <td>
                        <strong>
                          KSh{" "}
                          {Number(
                            item.total_amount
                          ).toLocaleString()}
                        </strong>
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