"use client";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signup(form.username, form.email, form.password);
    
    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Failed to create account. Email might already exist.");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#181825] via-[#232946] to-[#0f1021]">
      <div className="gaming-card max-w-md w-full p-8 relative">
        <div className="text-center mb-8 mt-2">
          <h1 className="text-2xl font-bold gaming-accent pixel-font mb-2">Join Focusfy</h1>
          <p className="text-sm text-white/70">Create your productivity account</p>
        </div>
        {error && (
          <div className="pixel-border bg-red-900/20 text-red-400 p-3 mb-4 text-xs">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs mb-1 pixel-font">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="gaming-input w-full"
              placeholder="Enter your username"
              required
            />
          </div>
          <div>
            <label className="block text-xs mb-1 pixel-font">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="gaming-input w-full"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-xs mb-1 pixel-font">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="gaming-input w-full"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="gaming-btn w-full px-6 py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>
        <div className="text-center mt-6">
          <span className="text-xs text-white/60">Already have an account?</span>
          <Link href="/signin" className="ml-2 text-cyan-400 hover:underline text-xs">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
