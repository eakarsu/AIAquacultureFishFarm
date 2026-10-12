import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, setToken, setStoredUser } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const demoEmail = process.env.REACT_APP_DEMO_EMAIL || '';
  const demoPassword = process.env.REACT_APP_DEMO_PASSWORD || '';
  const demoConfigured = process.env.REACT_APP_ENABLE_DEMO_CREDENTIAL_AUTOFILL === 'true' && Boolean(demoEmail && demoPassword);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await login(email, password);
      setToken(token);
      setStoredUser(user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1 className="login-brand">AQUAFARM</h1>
        <p className="login-sub">Net-Pen Operations Hub</p>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        {error && <div className="ai-error" style={{ marginBottom: 12 }}>{error}</div>}

        <button
          type="button"
          onClick={() => {
            setEmail(demoEmail);
            setPassword(demoPassword);
            setError(null);
          }}
          disabled={loading || !demoConfigured}
          aria-label="Fill Demo Credentials"
          title={demoConfigured ? 'Fill the configured local demo account' : 'Demo credential filling is not configured for this local build'}
          style={{ width: '100%', marginBottom: '12px', padding: '10px 14px', borderRadius: '8px', border: '1px solid currentColor', background: 'transparent', cursor: demoConfigured ? 'pointer' : 'not-allowed' }}
        >
          Fill Demo Credentials
        </button>
        <button className="btn" type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? <><span className="spinner" />Signing in...</> : 'Sign In'}
        </button>

        <p className="login-hint">
          {demoConfigured ? <>Demo account: <code>{demoEmail}</code></> : 'Demo credential filling is disabled until a local demo account is configured.'}
        </p>
      </form>
    </div>
  );
}
