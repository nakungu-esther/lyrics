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

    <div className="mx-auto max-w-md space-y-8 py-4">

      <div className="space-y-2 text-center sm:text-left">

        <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>

        <p className="text-sm text-zinc-400">Join Nyimba to save lyrics and videos.</p>

      </div>

      <form

        onSubmit={onSubmit}

        className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6"

        noValidate

      >

        <div className="grid gap-4 sm:grid-cols-2">

          <label className="block space-y-1">

            <span className="text-sm text-zinc-400">First name</span>

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

  );

}


