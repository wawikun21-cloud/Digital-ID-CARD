import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { login } from '../services/authService';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authLogin(identifier, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-cream px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-line bg-paper p-8 shadow-sm">
        <h1 className="font-serif text-2xl font-semibold text-ink">Sign in</h1>
        <p className="mt-2 text-sm text-ink-soft">Enter your credentials to access your digital ID.</p>

        {error && (
          <p className="mt-4 rounded-lg border border-maroon-light/30 bg-maroon-light/10 px-3 py-2 text-sm text-maroon-light">{error}</p>
        )}

        <div className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-ink">Username or email</span>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-gold focus:ring-1 focus:ring-gold"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-ink">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-gold focus:ring-1 focus:ring-gold"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-paper transition hover:bg-ink/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  );
}
