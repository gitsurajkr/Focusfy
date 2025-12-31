"use client"

import type React from "react"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Menu, X, Home, CheckSquare2, BookOpen, LogOut, Settings, Moon, Sun } from "lucide-react"
import { useTheme } from "../components/theme-provider"
import { useAuth } from "@/contexts/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"
import Image from "next/image"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false)
  const pathname = usePathname()
  const { theme, toggleTheme, mounted } = useTheme()
  const { user, logout } = useAuth()

  const menuItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard", id: "dashboard" },
    { href: "/dashboard/tasks", icon: CheckSquare2, label: "Tasks", id: "tasks" },
    { href: "/dashboard/notes", icon: BookOpen, label: "Notes", id: "notes" },
    // match the actual page folder name: mission-logs
    { href: "/dashboard/mission-logs", icon: BookOpen, label: "Tasks Logs", id: "tasks-logs" },
  ]

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`${sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64 lg:w-20 lg:translate-x-0"
            } bg-card border-r border-border transition-all duration-300 flex flex-col fixed left-0 top-0 bottom-0 z-40`}
        >
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-border">
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full  overflow-hidden">
                  <Image
                    src="/logof.png"
                    alt="logo"
                    width={30}
                    height={30}
                    className="object-cover w-full h-full rounded-full"
                  />
                </div>
                <span className="font-bold text-foreground text-lg">Focusfy</span>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 hover:bg-muted rounded-lg transition-smooth"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-smooth ${isActive(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
              >
                <item.icon size={20} />
                {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
              </Link>
            ))}
          </nav>

          {/* Bottom menu */}
          <div className="border-t border-border p-4 space-y-2">
            <Link
              href="/dashboard/settings"
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-smooth ${isActive("/dashboard/settings")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              <Settings size={20} />
              {sidebarOpen && <span className="font-medium text-sm">Settings</span>}
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-smooth">
              <LogOut size={20} />
              {sidebarOpen && <span className="font-medium text-sm">Logout</span>}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}>
          {/* Top bar */}
          <div className="h-16 border-b border-border bg-card px-4 md:px-6 flex items-center justify-between">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-muted rounded-lg transition-smooth"
            >
              <Menu size={24} />
            </button>

            <h2 className="text-sm md:text-lg font-semibold text-foreground hidden sm:block">
              Welcome, {user?.name || 'User'}
            </h2>
            <div className="flex items-center gap-2 md:gap-4 ml-auto">
              {/* Theme toggle button */}
              {mounted && (
                <button
                  onClick={toggleTheme}
                  className="p-2 hover:bg-muted rounded-lg transition-colors duration-200"
                  aria-label="Toggle theme"
                >
                  {theme === "light" ? (
                    <Moon size={20} className="text-foreground" />
                  ) : (
                    <Sun size={20} className="text-foreground" />
                  )}
                </button>
              )}
              {/* User Avatar */}
              <div className="relative">
                <button
                  className="focus:outline-none"
                  onClick={() => setAvatarDropdownOpen((open) => !open)}
                  aria-label="User menu"
                >
                  {user?.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name || "User"}
                      className="w-10 h-10 rounded-full object-cover border-2 border-primary/20 cursor-pointer"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-linear-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold cursor-pointer">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </button>
                {/* Dropdown */}
                {avatarDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-card border border-border rounded-lg shadow-lg z-50">
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors rounded-t-lg"
                      onClick={() => setAvatarDropdownOpen(false)}
                    >
                      <Settings size={18} />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setAvatarDropdownOpen(false)
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors rounded-b-lg text-left"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
