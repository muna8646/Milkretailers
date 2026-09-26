import { useEffect, useState } from "react";
import {
  Link,
  useParams,
} from "react-router-dom";

import Layout from "../../components/Layout";

import {
  getRetailer,
} from "../../services/api";

export default function RetailerDetails() {
  const { id } = useParams();

  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadRetailer();
  }, [id]);

  async function loadRetailer() {
    try {
      const result =
        await getRetailer(id);

      setData(result);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Layout title="Retailer">
        <div className="loading">
          Loading retailer...
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Retailer">
        <div className="error-box">
          {error}
        </div>
      </Layout>
    );
  }

  const retailer = data.retailer;

  return (
    <Layout
      title={retailer.business_name}
      subtitle="Retailer details and activity."
    >
      <div className="details-grid">
        <div className="detail-card">
          <h2>Retailer information</h2>

          <div className="detail-row">
            <span>Name</span>
            <strong>
              {retailer.name}
            </strong>
          </div>

          <div className="detail-row">
            <span>Email</span>
            <strong>
              {retailer.email}
            </strong>
          </div>

          <div className="detail-row">
            <span>Phone</span>
            <strong>
              {retailer.phone ||
                "Not provided"}
            </strong>
          </div>

          <div className="detail-row">
            <span>Status</span>

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
          </div>
        </div>

        <div className="detail-card">
          <h2>Collection summary</h2>

          <div className="big-number">
            {data.summary.litres.toFixed(2)} L
          </div>

          <p>Total milk collected</p>

          <div className="detail-row">
            <span>Collections</span>
            <strong>
              {data.summary.collectionCount}
            </strong>
          </div>

          <div className="detail-row">
            <span>Total value</span>
            <strong>
              KSh{" "}
              {data.summary.amount.toLocaleString()}
            </strong>
          </div>
        </div>
      </div>

      <Link
        to="/admin/retailers"
        className="secondary-button back-button"
      >
        ← Back to retailers
      </Link>
    </Layout>
  );
}