import { useState } from "react";
import Button from "../common/Button";

function Login({ username, password, setUsername, setPassword, onLogin, error }) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onLogin();
    setSubmitting(false);
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[var(--panel)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent)] text-lg font-semibold text-white">
            S
          </div>
          <h1 className="text-xl font-semibold text-white">Study Assistant</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Sign in to chat with your documents
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
        >
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="you"
            autoFocus
            className="mb-4 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-[var(--accent)]"
          />

          <label className="mb-1.5 block text-xs font-medium text-zinc-400">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mb-5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-[var(--accent)]"
          />

          {error && (
            <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full justify-center py-2.5"
            disabled={submitting || !username || !password}
          >
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Login;