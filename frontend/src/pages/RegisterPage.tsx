import { FormEvent, useMemo, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { ApiError } from "../api/client";

import { Button } from "../components/ui/Button";

import { Input } from "../components/ui/Input";

import { useAuth } from "../features/auth/AuthContext";



function isValidEmail(value: string): boolean {

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

}



export function RegisterPage() {

  const { register } = useAuth();

  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");

  const [lastName, setLastName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [error, setError] = useState<string | null>(null);

  const [pending, setPending] = useState(false);



  const canSubmit = useMemo(() => {

    return (

      firstName.trim().length > 0 &&

      lastName.trim().length > 0 &&

      isValidEmail(email) &&

      password.length >= 8 &&

      password === confirmPassword &&

      !pending

    );

  }, [firstName, lastName, email, password, confirmPassword, pending]);



  async function onSubmit(e: FormEvent) {

    e.preventDefault();

    const next: Record<string, string> = {};

    if (!firstName.trim()) next.firstName = "First name is required.";

    if (!lastName.trim()) next.lastName = "Last name is required.";

    if (!isValidEmail(email)) next.email = "Enter a valid email address.";

    if (password.length < 8) next.password = "Use at least 8 characters.";

    if (password !== confirmPassword) next.confirmPassword = "Passwords do not match.";

    setFieldErrors(next);

    if (Object.keys(next).length > 0) return;



    setError(null);

    setPending(true);

    try {

      await register(email.trim(), password, firstName.trim(), lastName.trim());

      navigate("/dashboard");

    } catch (err) {

      if (err instanceof ApiError) {

        if (err.status === 409) {

          setError("An account with this email already exists.");

        } else if (err.status === 503 || err.code === "DB_INIT" || err.code === "P1001") {

          setError(err.message || "Database unavailable. Fix DATABASE_URL and restart the API.");

        } else if (err.status >= 500) {

          setError(err.message || "Something went wrong on our side. Please try again later.");

        } else {

          setError(err.message || "Registration failed.");

        }

      } else {

        setError("Registration failed. Please try again.");

      }

    } finally {

      setPending(false);

    }

  }



  return (

    <div className="auth-page mx-auto w-full max-w-5xl py-4 sm:py-8">
      <div className="auth-visual hidden min-h-[700px] flex-col justify-between rounded-3xl p-10 lg:flex">
        <div><div className="auth-brand-mark">L</div><p className="mt-3 text-sm font-semibold tracking-wide text-white">LyricsHub</p></div>
        <div><p className="max-w-sm text-4xl font-bold leading-tight text-white">Join LyricsHub</p><p className="mt-5 max-w-xs text-sm leading-6 text-slate-300">Create your account and start turning your music into beautiful lyric videos.</p><ul className="auth-benefits mt-6 space-y-3 text-sm text-slate-200"><li>Unlimited lyric videos</li><li>Access to premium templates</li><li>Cloud storage</li><li>Share with the world</li></ul><p className="mt-10 text-3xl font-semibold italic text-violet-300">Your Music<br />Matters</p></div>
      </div>
      <div className="auth-form-panel mx-auto w-full max-w-md space-y-8 rounded-3xl p-6 sm:p-10">

      <div className="space-y-2 text-center sm:text-left">

        <h1 className="text-2xl font-semibold tracking-tight">Create Your Account</h1>

<<<<<<< HEAD
        <p className="text-sm text-zinc-400">Join LyricsHub to save lyrics and videos.</p>
=======
        <p className="text-sm text-zinc-400">Join LyricsHub and start creating today</p>
>>>>>>> e711cfddafb0be738c823e5a9c3aae82821ed99c

      </div>

      <form

        onSubmit={onSubmit}

        className="auth-form space-y-4 rounded-2xl border p-6"

        noValidate

      >

        <div className="grid gap-4 sm:grid-cols-2">

          <label className="block space-y-1">

            <span className="text-sm text-zinc-400">Full Name</span>

            <Input

              required

              value={firstName}

              onChange={(e) => setFirstName(e.target.value)}

              autoComplete="given-name"

            />

            {fieldErrors.firstName && (

              <p className="text-xs text-red-400">{fieldErrors.firstName}</p>

            )}

          </label>

          <label className="block space-y-1">

            <span className="text-sm text-zinc-400">Last name</span>

            <Input

              required

              value={lastName}

              onChange={(e) => setLastName(e.target.value)}

              autoComplete="family-name"

            />

            {fieldErrors.lastName && (

              <p className="text-xs text-red-400">{fieldErrors.lastName}</p>

            )}

          </label>

        </div>

        <label className="block space-y-1">

          <span className="text-sm text-zinc-400">Email</span>

          <Input

            type="email"

            autoComplete="email"

            required

            value={email}

            onChange={(e) => setEmail(e.target.value)}

          />

          {fieldErrors.email && (

            <p className="text-xs text-red-400">{fieldErrors.email}</p>

          )}

        </label>

        <label className="block space-y-1">

          <span className="text-sm text-zinc-400">Password (min 8 characters)</span>

          <Input

            type="password"

            autoComplete="new-password"

            required

            minLength={8}

            value={password}

            onChange={(e) => setPassword(e.target.value)}

          />

          {fieldErrors.password && (

            <p className="text-xs text-red-400">{fieldErrors.password}</p>

          )}

        </label>

        <label className="block space-y-1">

          <span className="text-sm text-zinc-400">Confirm password</span>

          <Input

            type="password"

            autoComplete="new-password"

            required

            value={confirmPassword}

            onChange={(e) => setConfirmPassword(e.target.value)}

          />

          {fieldErrors.confirmPassword && (

            <p className="text-xs text-red-400">{fieldErrors.confirmPassword}</p>

          )}

        </label>

        {error && (

          <p className="text-sm text-red-400" role="alert">

            {error}

          </p>

        )}

        <Button type="submit" disabled={!canSubmit} className="w-full">

          {pending ? "Creating…" : "Register"}

        </Button>

      </form>

      <p className="text-center text-sm text-zinc-500 sm:text-left">

        Already have an account?{" "}

        <Link to="/login" className="text-violet-400 hover:underline">

          Log in

        </Link>

      </p>

      </div>
    </div>

  );

}


