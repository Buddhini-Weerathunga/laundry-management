import { useEffect, useState } from "react";
import "../../App.css";

const TOKEN_KEY = "laundry_admin_token";

function LaundryMark() {
  return (
    <div className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 48 48">
        <path d="M14 8h20a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6V14a6 6 0 0 1 6-6Z" />
        <circle cx="24" cy="26" r="9" />
        <circle cx="15" cy="15" r="2" />
        <path d="M22 22c3.5 3.4 6.5.7 9 3.4" />
      </svg>
    </div>
  );
}

function Dashboard({ admin, onLogout }) {
  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div className="brand compact">
          <LaundryMark />
          <span>FreshFold</span>
        </div>
        <button className="logout-button" onClick={onLogout}>
          Log out
        </button>
      </header>
      <section className="welcome-card">
        <span className="status-dot">Authenticated</span>
        <p className="eyebrow">Admin dashboard</p>
        <h1>Welcome back, {admin.username}.</h1>
        <p>You are securely signed in with the {admin.role} role.</p>
      </section>
    </main>
  );
}

function AdminLogin() {
  const [initialToken] = useState(
    () => localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY),
  );
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(Boolean(initialToken));
  const [error, setError] = useState("");
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    if (!initialToken) return;
    fetch("/api/admin/me", {
      headers: { Authorization: `Bearer ${initialToken}` },
    })
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then(setAdmin)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setCheckingSession(false));
  }, [initialToken]);

  const updateField = (event) => {
    setCredentials((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(data.error || "Unable to sign in. Please try again.");
      const storage = remember ? localStorage : sessionStorage;
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      storage.setItem(TOKEN_KEY, data.token);
      const profileResponse = await fetch("/api/admin/me", {
        headers: {
          Authorization: `${data.tokenType || "Bearer"} ${data.token}`,
        },
      });
      if (!profileResponse.ok)
        throw new Error("Could not verify the admin account.");
      setAdmin(await profileResponse.json());
    } catch (requestError) {
      setError(
        requestError.message === "Failed to fetch"
          ? "Cannot reach the server. Make sure the backend is running."
          : requestError.message,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    setAdmin(null);
    setCredentials({ username: "", password: "" });
  };

  if (checkingSession)
    return <div className="session-loader" aria-label="Loading session" />;
  if (admin) return <Dashboard admin={admin} onLogout={handleLogout} />;

  return (
    <main className="login-page">
      <section className="visual-panel">
        <div className="brand">
          <LaundryMark />
          <span>FreshFold</span>
        </div>
        <div className="visual-copy">
          <p className="eyebrow light">Laundry management, simplified</p>
          <h1>
            Clean operations.
            <br />
            Clear oversight.
          </h1>
          <p>
            Manage orders, track daily progress, and keep every load moving from
            one calm workspace.
          </p>
        </div>
        <div className="washer-art" aria-hidden="true">
          <div className="bubble bubble-one" />
          <div className="bubble bubble-two" />
          <div className="machine">
            <div className="machine-controls">
              <i />
              <i />
              <span />
            </div>
            <div className="machine-door">
              <div />
            </div>
          </div>
          <div className="floor-line" />
        </div>
        <p className="visual-footer">Fresh clothes. Happy customers.</p>
      </section>
      <section className="form-panel">
        <div className="login-card">
          <div className="mobile-brand brand">
            <LaundryMark />
            <span>FreshFold</span>
          </div>
          <p className="eyebrow">Admin portal</p>
          <h2>Welcome back</h2>
          <p className="intro">Sign in to manage your laundry business.</p>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}
            <label htmlFor="username">Username</label>
            <div className="input-wrap">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21a8 8 0 0 1 16 0" />
              </svg>
              <input
                id="username"
                name="username"
                value={credentials.username}
                onChange={updateField}
                placeholder="Enter your username"
                autoComplete="username"
                required
                autoFocus
              />
            </div>
            <label htmlFor="password">Password</label>
            <div className="input-wrap">
              <svg viewBox="0 0 24 24">
                <rect x="5" y="10" width="14" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={credentials.password}
                onChange={updateField}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
              <button
                className="eye-button"
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="2.5" />
                </svg>
              </button>
            </div>
            <label className="remember-row">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
              />
              <span>Keep me signed in</span>
            </label>
            <button className="submit-button" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" />
                  Signing in...
                </>
              ) : (
                "Sign in to dashboard"
              )}
            </button>
          </form>
          <p className="secure-note">
            <span>◆</span> Secure admin access
          </p>
        </div>
      </section>
    </main>
  );
}

export default AdminLogin;
