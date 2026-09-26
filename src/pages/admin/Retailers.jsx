import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Eye,
  Power,
} from "lucide-react";

import Layout from "../../components/Layout";

import {
  getRetailers,
  updateRetailerStatus,
} from "../../services/api";

export default function Retailers() {
  const [retailers, setRetailers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadRetailers();
  }, []);

  async function loadRetailers() {
    try {
      const data =
        await getRetailers();

      setRetailers(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(
    retailer
  ) {
    try {
      await updateRetailerStatus(
        retailer.id,
        !retailer.is_active
      );

      await loadRetailers();
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <Layout
      title="Retailers"
      subtitle="Manage all retailers registered on MilkCollect."
    >
      <div className="page-actions">
        <Link
          to="/admin/retailers/new"
          className="primary-button"
        >
          <Plus size={19} />
          Add retailer
        </Link>
      </div>

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      <div className="table-container">
        {loading ? (
          <div className="loading">
            Loading retailers...
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Retailer Name</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {retailers.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="empty-state"
                  >
                    No retailers registered yet.
                  </td>
                </tr>
              ) : (
                retailers.map(
                  (retailer) => (
                    <tr key={retailer.id}>
                      <td>
                        <strong>
                          {retailer.business_name}
                        </strong>
                      </td>

                      <td>
                        {retailer.retailer_name || retailer.name || "—"}
                      </td>

                      <td>
                        {retailer.phone || "No phone"}
                      </td>

                      <td>
                        <span
                          className={`status ${
                            retailer.is_active
                              ? "active"
                              : "inactive"
                          }`}
                        >
                          {retailer.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <div className="action-buttons">
                          <Link
                            to={`/admin/retailers/${retailer.id}`}
                            className="icon-button"
                            title="View"
                          >
                            <Eye size={18} />
                          </Link>

                          <button
                            onClick={() =>
                              toggleStatus(
                                retailer
                              )
                            }
                            className="icon-button"
                            title={
                              retailer.is_active
                                ? "Deactivate"
                                : "Activate"
                            }
                          >
                            <Power
                              size={18}
                            />
                          </button>
                        </div>
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