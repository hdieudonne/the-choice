"use client";

import { FormEvent, Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const sessionExpired = searchParams.get("error") === "SessionExpired";

  return (
    <div className="w-full max-w-md rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1e1b] p-8 shadow-sm">
      <Link
        href="/"
        className="text-sm text-stone-500 dark:text-stone-400 transition hover:text-stone-900 dark:hover:text-stone-100"
      >
        ← Back to The Choice Style
      </Link>

      <div className="mt-8">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.svg"
            alt="The Choice Style logo"
            className="h-9 w-9 rounded-xl object-contain shadow-xs"
          />
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#788568] dark:text-[#8da47a]">
            The Choice Style
          </p>
        </div>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#263b2d] dark:text-stone-100">
          Admin sign in
        </h1>

        <p className="mt-2 text-sm leading-6 text-stone-500 dark:text-stone-400">
          Sign in to manage your products, prices, sizes and stock.
        </p>
      </div>

      {(error || sessionExpired) && (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300"
        >
          {error || "Your session has expired. Please sign in again."}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            Email address
          </label>

          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-4 py-3 text-sm text-stone-900 dark:text-stone-100 outline-none transition focus:border-[#788568] focus:ring-2 focus:ring-[#788568]/20 dark:focus:border-[#8da47a] dark:focus:ring-[#8da47a]/20"
            placeholder="admin@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            Password
          </label>

          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-4 py-3 text-sm text-stone-900 dark:text-stone-100 outline-none transition focus:border-[#788568] focus:ring-2 focus:ring-[#788568]/20 dark:focus:border-[#8da47a] dark:focus:ring-[#8da47a]/20"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#263b2d] dark:bg-[#3a5543] px-4 py-3 font-medium text-white transition hover:bg-[#354d3c] dark:hover:bg-[#4a6852] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-stone-400 dark:text-stone-600">
        Authorized administrators only.
      </p>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf9f6] dark:bg-[#111210] px-4 py-12">
      <Suspense fallback={
        <div className="flex items-center gap-2 text-stone-400">
          <Loader2 size={20} className="animate-spin" />
          <span>Loading…</span>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </main>
  );
}
