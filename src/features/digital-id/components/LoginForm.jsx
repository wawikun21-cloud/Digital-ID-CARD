import { useId, useState } from 'react';
import TextField from '../../../shared/components/TextField';
import { LockIcon } from '../../../shared/components/icons';

/**
 * Gate in front of the editor. Owns its own input and error state —
 * `onLogin` is just a predicate (email, password) => boolean, so this
 * component knows nothing about how credentials are actually checked
 * or persisted, only how to ask and how to react to "no".
 */
export default function LoginForm({ onLogin }) {
  const emailId = useId();
  const passwordId = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    const ok = onLogin(email, password);
    if (!ok) {
      setError('Incorrect email or password.');
      setPassword('');
    }
    setSubmitting(false);
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-cream px-6 py-14">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-paper p-6 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-paper">
            <LockIcon />
          </span>
          <p className="mt-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Digital ID
          </p>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-ink">Sign in to edit</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Only signed-in staff can change this credential. Scanning the QR code still shows
            the public view — no sign-in needed for that.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <TextField
            id={emailId}
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@organization.com"
          />
          <TextField
            id={passwordId}
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
          />

          {error && (
            <p role="alert" className="text-xs font-medium text-maroon-light">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 flex items-center justify-center rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-paper shadow-sm transition hover:bg-maroon-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:opacity-60"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
