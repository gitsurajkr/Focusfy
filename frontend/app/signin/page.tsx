"use client";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signin } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signin(form.email, form.password);
    
    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Invalid email or password");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#181825] via-[#232946] to-[#0f1021]">
      <div className="gaming-card max-w-md w-full p-8 relative">
        <div className="text-center mb-8 mt-2">
          <h1 className="text-2xl font-bold gaming-accent pixel-font mb-2">Welcome to Focusfy</h1>
          <p className="text-sm text-white/70">Sign in to manage your productivity!</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs mb-1 pixel-font">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="gaming-input w-full"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-xs mb-1 pixel-font">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="gaming-input w-full"
              placeholder="••••••••"
            />
          </div>
          {error && (
            <div className="pixel-border bg-red-900/20 text-red-400 p-3 text-xs mb-2">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="gaming-btn w-full px-6 py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="text-center mt-6">
          <span className="text-xs text-white/60">Don&apos;t have an account?</span>
          <Link href="/signup" className="ml-2 text-cyan-400 hover:underline text-xs">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
