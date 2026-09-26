import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Milk, UserPlus } from "lucide-react";

import { login, registerRetailer } from "../services/api";
import { useAuth } from "../context/AuthContext";

const blankRegisterForm = {
  name: "",
  email: "",
  password: "",
  businessName: "",
  phone: "",
};

export default function Login() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [registerForm, setRegisterForm] = useState(blankRegisterForm);
  const [registerError, setRegisterError] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  function handleRegisterChange(e) {
    setRegisterForm({
      ...registerForm,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);

      loginUser(data);

      if (data.user.role === "OWNER") {
        navigate("/admin/dashboard");
      } else {
        navigate("/retailer/dashboard");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    setRegisterError("");
    setRegisterMessage("");
    setRegisterLoading(true);

    try {
      await registerRetailer(registerForm);
      setRegisterMessage(
        "Your retailer account has been created successfully. Please wait for admin approval before you can log in. If it takes time, call the admin on +254 700 000 000 for more information."
      );
      setRegisterForm(blankRegisterForm);
    } catch (error) {
      setRegisterError(error.message);
    } finally {
      setRegisterLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="brand">
          <div className="brand-icon">
            <Milk size={32} />
          </div>

          <div>
            <h2>MilkCollect</h2>
            <p>Milk Collection Management</p>
          </div>
        </div>

        <div className="hero-content">
          <h1>
            Manage your milk
            <br />
            collection and farmer
            <br />
            payments with ease.
          </h1>

          <p>
            Record daily deliveries, calculate weekly earnings,
            process payments, and give your farmers a transparent
            view of their records — all in one place.
          </p>
        </div>

        <div className="feature-cards">
          <div>
            <strong>Daily</strong>
            <span>Milk records</span>
          </div>

          <div>
            <strong>Weekly</strong>
            <span>Payments</span>
          </div>

          <div>
            <strong>Secure</strong>
            <span>Farmer access</span>
          </div>
        </div>

        <div className="copyright">
          © 2026 MilkCollect. All rights reserved.
        </div>
      </div>

      <div className="login-right">
        <div className="auth-stack single-auth-card">
          <div className="login-box">
            {!showRegisterForm ? (
              <>
                <div className="auth-header">
                  <h1>Welcome back</h1>
                  <span>Sign in to your account</span>
                </div>

                <form onSubmit={handleSubmit}>
                  <label>Email</label>

                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <label>Password</label>

                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />

                  {error && (
                    <div className="login-error">
                      {error}
                    </div>
                  )}

                  <button type="submit" disabled={loading}>
                    <LogIn size={20} />
                    {loading ? "Signing in..." : "Sign in"}
                  </button>

                  <p className="auth-switch">
                    Don’t have an account?{" "}
                    <button type="button" onClick={() => setShowRegisterForm(true)}>
                      Create account
                    </button>
                  </p>
                </form>
              </>
            ) : (
              <>
                <div className="auth-header compact">
                  <h2>Create account</h2>
                  <span>Retailer registration</span>
                </div>

                <form onSubmit={handleRegisterSubmit}>
                  <div className="form-grid auth-form-grid">
                    <div className="form-group">
                      <label>Contact name</label>
                      <input
                        name="name"
                        value={registerForm.name}
                        onChange={handleRegisterChange}
                        placeholder="Your full name"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Business name</label>
                      <input
                        name="businessName"
                        value={registerForm.businessName}
                        onChange={handleRegisterChange}
                        placeholder="Your business name"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={registerForm.email}
                        onChange={handleRegisterChange}
                        placeholder="you@example.com"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        name="phone"
                        value={registerForm.phone}
                        onChange={handleRegisterChange}
                        placeholder="07XXXXXXXX"
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Password</label>
                      <input
                        type="password"
                        name="password"
                        value={registerForm.password}
                        onChange={handleRegisterChange}
                        placeholder="Create password"
                        minLength="6"
                        required
                      />
                    </div>
                  </div>

                  {registerError && (
                    <div className="login-error">{registerError}</div>
                  )}
                  {registerMessage && (
                    <div className="register-success">{registerMessage}</div>
                  )}

                  <button type="submit" className="register-button" disabled={registerLoading}>
                    <UserPlus size={18} />
                    {registerLoading ? "Submitting..." : "Create account"}
                  </button>

                  <p className="auth-switch">
                    Already have an account?{" "}
                    <button type="button" onClick={() => setShowRegisterForm(false)}>
                      Sign in
                    </button>
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}