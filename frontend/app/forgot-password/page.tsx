"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Mail, Loader2 } from "lucide-react"
import { authApi } from "@/lib/api"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!email) {
      setError("Email is required")
      return
    }

    setIsLoading(true)

    try {
      await authApi.forgotPassword({ email })
      setSuccess(true)
      setEmail("")
    } catch (err: any) {
      setError(err.message || "Failed to send reset email")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted flex items-center justify-center p-4">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Back button */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Sign In
        </Link>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-linear-to-br from-primary to-secondary rounded-xl mb-4">
            <Mail className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Forgot Password?</h1>
          <p className="text-sm text-muted-foreground mt-2">
            No worries, we'll send you reset instructions
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4 transition-smooth hover:shadow-md"
        >
          {success && (
            <div className="bg-secondary/10 border border-secondary/20 text-secondary px-4 py-3 rounded-lg text-sm">
              If an account exists with this email, you will receive password reset instructions.
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!success && (
            <>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-smooth"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-linear-to-r from-primary to-secondary text-primary-foreground font-semibold py-2.5 rounded-lg transition-smooth hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Sending...
                  </>
                ) : (
                  "Send Reset Instructions"
                )}
              </button>
            </>
          )}

          {success && (
            <Link href="/">
              <button
                type="button"
                className="w-full bg-linear-to-r from-primary to-secondary text-primary-foreground font-semibold py-2.5 rounded-lg transition-smooth hover:shadow-lg"
              >
                Back to Sign In
              </button>
            </Link>
          )}
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          Remember your password?{" "}
          <Link href="/" className="text-primary hover:text-primary/80 font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
