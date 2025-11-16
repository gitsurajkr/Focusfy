"use client"

import type React from "react"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Menu, X, Home, CheckSquare2, BookOpen, LogOut, Settings, Moon, Sun } from "lucide-react"
import { useTheme } from "../components/theme-provider"
import { useAuth } from "@/contexts/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { theme, toggleTheme, mounted } = useTheme()
  const { user, logout } = useAuth()

  const menuItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard", id: "dashboard" },
    { href: "/dashboard/tasks", icon: CheckSquare2, label: "Tasks", id: "tasks" },
    { href: "/dashboard/notes", icon: BookOpen, label: "Notes", id: "notes" },
    { href: "/dashboard/mission-logs", icon: BookOpen, label: "Mission Logs", id: "mission-logs" },
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
        className={`${
          sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64 lg:w-20 lg:translate-x-0"
        } bg-card border-r border-border transition-all duration-300 flex flex-col fixed left-0 top-0 bottom-0 z-40`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-linear-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                </svg>
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
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-smooth ${
                isActive(item.href)
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
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-smooth ${
              isActive("/dashboard/settings")
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
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || "User"}
                className="w-10 h-10 rounded-full object-cover border-2 border-primary/20 cursor-pointer"
              />
            ) : (
              <div className="w-10 h-10 bg-linear-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold cursor-pointer">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
    </div>
    </ProtectedRoute>
  )
}
