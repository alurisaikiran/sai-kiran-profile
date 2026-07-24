"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "sign-in" | "forgot" | "reset";

export default function AdminLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [recoveryTokens, setRecoveryTokens] = useState<{ access: string; refresh: string } | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Supabase sends the recovery link back with tokens in the URL hash.
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    if (params.get("type") === "recovery" && params.get("access_token")) {
      setRecoveryTokens({
        access: params.get("access_token")!,
        refresh: params.get("refresh_token") ?? "",
      });
      setMode("reset");
    }
  }, []);

  async function onSignIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Login failed");
        setBusy(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error");
      setBusy(false);
    }
  }

  async function onForgot(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => undefined);
    setSuccess(`If ${email} is registered, a reset link is on its way. Check your inbox.`);
    setBusy(false);
  }

  async function onReset(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: recoveryTokens?.access,
          refresh_token: recoveryTokens?.refresh,
          new_password: newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Reset failed");
        setBusy(false);
        return;
      }
      window.history.replaceState(null, "", window.location.pathname);
      setMode("sign-in");
      setSuccess("Password updated. Sign in with your new password.");
      setBusy(false);
    } catch {
      setError("Network error");
      setBusy(false);
    }
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setSuccess(null);
  }

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        {mode === "sign-in" && (
          <>
            <h1>Admin Login</h1>
            <p>Sai Kiran Aluri · Portfolio CMS</p>
            {error && <div className="admin-notice error">{error}</div>}
            {success && <div className="admin-notice success">{success}</div>}
            <form onSubmit={onSignIn}>
              <div className="admin-field">
                <label htmlFor="email">Email</label>
                <input
                  className="admin-input"
                  id="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="admin-field">
                <div className="admin-field-head">
                  <label htmlFor="password">Password</label>
                  <button type="button" className="admin-link" onClick={() => switchMode("forgot")}>
                    Forgot password?
                  </button>
                </div>
                <input
                  className="admin-input"
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button className="admin-btn primary" type="submit" disabled={busy} style={{ width: "100%" }}>
                {busy ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </>
        )}

        {mode === "forgot" && (
          <>
            <h1>Reset Password</h1>
            <p>Enter your admin email and we&apos;ll send a reset link.</p>
            {error && <div className="admin-notice error">{error}</div>}
            {success && <div className="admin-notice success">{success}</div>}
            <form onSubmit={onForgot}>
              <div className="admin-field">
                <label htmlFor="forgot-email">Email</label>
                <input
                  className="admin-input"
                  id="forgot-email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button className="admin-btn primary" type="submit" disabled={busy} style={{ width: "100%" }}>
                {busy ? "Sending…" : "Send Reset Link"}
              </button>
            </form>
            <button type="button" className="admin-link" style={{ marginTop: 16 }} onClick={() => switchMode("sign-in")}>
              Back to sign in
            </button>
          </>
        )}

        {mode === "reset" && (
          <>
            <h1>Set New Password</h1>
            <p>Choose a new password for your admin account.</p>
            {error && <div className="admin-notice error">{error}</div>}
            <form onSubmit={onReset}>
              <div className="admin-field">
                <label htmlFor="new-password">New Password</label>
                <input
                  className="admin-input"
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="admin-field">
                <label htmlFor="confirm-password">Confirm Password</label>
                <input
                  className="admin-input"
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <button className="admin-btn primary" type="submit" disabled={busy} style={{ width: "100%" }}>
                {busy ? "Updating…" : "Update Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
