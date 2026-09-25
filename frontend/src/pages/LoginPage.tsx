import { FormEvent, useMemo, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { ApiError } from "../api/client";

import { Button } from "../components/ui/Button";

import { Input } from "../components/ui/Input";

import { useAuth } from "../features/auth/AuthContext";



function isValidEmail(value: string): boolean {

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

}



export function LoginPage() {

  const { login } = useAuth();

  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>(

    {},

  );

  const [error, setError] = useState<string | null>(null);

  const [pending, setPending] = useState(false);



  const canSubmit = useMemo(

    () => isValidEmail(email) && password.length > 0 && !pending,

    [email, password, pending],

  );



  async function onSubmit(e: FormEvent) {

    e.preventDefault();

    const nextErrors: { email?: string; password?: string } = {};

    if (!isValidEmail(email)) nextErrors.email = "Enter a valid email address.";

    if (!password) nextErrors.password = "Password is required.";

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;



    setError(null);

    setPending(true);

    try {

      await login(email.trim(), password);

      navigate("/dashboard");

    } catch (err) {

      if (err instanceof ApiError) {

        if (err.status === 503 || err.code === "DB_INIT" || err.code === "P1001") {

          setError(
            err.message ||
              "Database unavailable. Check backend DATABASE_URL (Neon), run migrations, then restart the API.",
          );

        } else if (err.status >= 500) {

          setError(err.message || "Something went wrong on our side. Please try again later.");

        } else if (err.status === 0 || err.code === "ERROR") {

          setError("Network error. Is the API running on port 4000? Check npm run dev.");

        } else {

          setError(err.message || "Invalid email or password.");

        }

      } else {

        setError("Login failed. Please try again.");

      }

    } finally {

      setPending(false);

    }

  }



  return (

    <div className="auth-page mx-auto w-full max-w-5xl py-4 sm:py-8">
      <div className="auth-visual hidden min-h-[620px] flex-col justify-between rounded-3xl p-10 lg:flex">
        <div><div className="auth-brand-mark">L</div><p className="mt-3 text-sm font-semibold tracking-wide text-white">LyricsHub</p></div>
        <div><p className="max-w-sm text-4xl font-bold leading-tight text-white">Create. Edit.<br /><span className="text-violet-300">Share your story.</span></p><p className="mt-5 max-w-xs text-sm leading-6 text-slate-300">Continue creating beautiful lyric videos with your music and your voice.</p></div>
      </div>
      <div className="auth-form-panel mx-auto w-full max-w-md space-y-8 rounded-3xl p-6 sm:p-10">

      <div className="space-y-2 text-center sm:text-left">

        <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>

        <p className="text-sm text-zinc-400">Access your Nyimba dashboard.</p>

      </div>

      <form onSubmit={onSubmit} className="auth-form space-y-4 rounded-2xl border p-6" noValidate>

        <label className="block space-y-1">

          <span className="text-sm text-zinc-400">Email</span>

          <Input

            type="email"

            autoComplete="email"

            required

            value={email}

            onChange={(e) => setEmail(e.target.value)}

            aria-invalid={Boolean(fieldErrors.email)}

          />

          {fieldErrors.email && (

            <p className="text-xs text-red-400">{fieldErrors.email}</p>

          )}

        </label>

        <label className="block space-y-1">

          <span className="text-sm text-zinc-400">Password</span>

          <Input

            type="password"

            autoComplete="current-password"

            required

            value={password}

            onChange={(e) => setPassword(e.target.value)}

            aria-invalid={Boolean(fieldErrors.password)}

          />

          {fieldErrors.password && (

            <p className="text-xs text-red-400">{fieldErrors.password}</p>

          )}

        </label>

        {error && (

          <p className="text-sm text-red-400" role="alert">

            {error}

          </p>

        )}

        <Button type="submit" disabled={!canSubmit} className="w-full">

          {pending ? "Signing in…" : "Log in"}

        </Button>

      </form>

      <p className="text-center text-sm text-zinc-500 sm:text-left">

        No account?{" "}

        <Link to="/register" className="text-violet-400 hover:underline">

          Register

        </Link>

      </p>

      </div>
    </div>

  );

}


