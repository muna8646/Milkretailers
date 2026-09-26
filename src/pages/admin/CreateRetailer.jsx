import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../../components/Layout";

import {
  createRetailer,
} from "../../services/api";

export default function CreateRetailer() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    businessName: "",
    phone: "",
  });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await createRetailer(form);

      navigate("/admin/retailers");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout
      title="Add Retailer"
      subtitle="Create a new retailer account."
    >
      <div className="form-card">
        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>
                Contact name
              </label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. John Kamau"
                required
              />
            </div>

            <div className="form-group">
              <label>
                Business name
              </label>

              <input
                name="businessName"
                value={form.businessName}
                onChange={handleChange}
                placeholder="e.g. Kamau Milk Shop"
                required
              />
            </div>

            <div className="form-group">
              <label>
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="retailer@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>
                Phone
              </label>

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="07XXXXXXXX"
              />
            </div>

            <div className="form-group full">
              <label>
                Initial password
              </label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create initial password"
                minLength="6"
                required
              />

              <small>
                Give this password to the retailer
                securely. They can later change it.
              </small>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                navigate("/admin/retailers")
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading
                ? "Creating..."
                : "Create retailer"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}