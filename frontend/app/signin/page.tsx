"use client";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3001';

export default function SignInPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage("");
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setForgotMessage("If the email exists, a reset link has been sent to your email address.");
        setForgotEmail("");
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotMessage("");
        }, 5000);
      } else {
        setError(data.error || "Failed to send reset email");
      }
    } catch (error) {
      setError("Network error. Please try again.");
      console.error('Forgot password error:', error);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#181825] via-[#232946] to-[#0f1021]">
      <div className="gaming-card max-w-md w-full p-8 relative">
        <div className="text-center mb-8 mt-2">
          <h1 className="text-2xl font-bold gaming-accent pixel-font mb-2">
            {showForgotPassword ? 'Reset Password' : 'Welcome to Focusfy'}
          </h1>
          <p className="text-sm text-white/70">
            {showForgotPassword ? 'Enter your email to reset your password' : 'Sign in to manage your productivity!'}
          </p>
        </div>

        {!showForgotPassword ? (
          <>
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
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="gaming-input w-full pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 focus:outline-none"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 640 640"><path fill="#ffffff" d="M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L504.5 470.8C507.2 468.4 509.9 466 512.5 463.6C559.3 420.1 590.6 368.2 605.5 332.5C608.8 324.6 608.8 315.8 605.5 307.9C590.6 272.2 559.3 220.2 512.5 176.8C465.4 133.1 400.7 96.2 319.9 96.2C263.1 96.2 214.3 114.4 173.9 140.4L73 39.1zM236.5 202.7C260 185.9 288.9 176 320 176C399.5 176 464 240.5 464 320C464 351.1 454.1 379.9 437.3 403.5L402.6 368.8C415.3 347.4 419.6 321.1 412.7 295.1C399 243.9 346.3 213.5 295.1 227.2C286.5 229.5 278.4 232.9 271.1 237.2L236.4 202.5zM357.3 459.1C345.4 462.3 332.9 464 320 464C240.5 464 176 399.5 176 320C176 307.1 177.7 294.6 180.9 282.7L101.4 203.2C68.8 240 46.4 279 34.5 307.7C31.2 315.6 31.2 324.4 34.5 332.3C49.4 368 80.7 420 127.5 463.4C174.6 507.1 239.3 544 320.1 544C357.4 544 391.3 536.1 421.6 523.4L357.4 459.2z" /></svg>) : (

                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 640 640"><path fill="#ffffff" d="M320 96C239.2 96 174.5 132.8 127.4 176.6C80.6 220.1 49.3 272 34.4 307.7C31.1 315.6 31.1 324.4 34.4 332.3C49.3 368 80.6 420 127.4 463.4C174.5 507.1 239.2 544 320 544C400.8 544 465.5 507.2 512.6 463.4C559.4 419.9 590.7 368 605.6 332.3C608.9 324.4 608.9 315.6 605.6 307.7C590.7 272 559.4 220 512.6 176.6C465.5 132.9 400.8 96 320 96zM176 320C176 240.5 240.5 176 320 176C399.5 176 464 240.5 464 320C464 399.5 399.5 464 320 464C240.5 464 176 399.5 176 320zM320 256C320 291.3 291.3 320 256 320C244.5 320 233.7 317 224.3 311.6C223.3 322.5 224.2 333.7 227.2 344.8C240.9 396 293.6 426.4 344.8 412.7C396 399 426.4 346.3 412.7 295.1C400.5 249.4 357.2 220.3 311.6 224.3C316.9 233.6 320 244.4 320 256z" /></svg>
                    )}
                  </button>
                </div>
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

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-xs text-cyan-400 hover:underline pixel-font"
              >
                Forgot your password?
              </button>
            </div>

            <div className="text-center mt-6">
              <span className="text-xs text-white/60">Don&apos;t have an account?</span>
              <Link href="/signup" className="ml-2 text-cyan-400 hover:underline text-xs">Sign Up</Link>
            </div>
          </>
        ) : (
          <>
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label className="block text-xs mb-1 pixel-font">Email Address</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  className="gaming-input w-full"
                  placeholder="your@email.com"
                />
              </div>

              {error && (
                <div className="pixel-border bg-red-900/20 text-red-400 p-3 text-xs mb-2">
                  {error}
                </div>
              )}

              {forgotMessage && (
                <div className="pixel-border bg-green-900/20 text-green-400 p-3 text-xs mb-2">
                  {forgotMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={forgotLoading}
                className="gaming-btn w-full px-6 py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {forgotLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotEmail("");
                  setForgotMessage("");
                  setError("");
                }}
                className="text-xs text-cyan-400 hover:underline pixel-font"
              >
                Back to Sign In
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
