"use client";
import { useState } from "react";
import Link from "next/link";

interface HeaderProps {
  user: unknown;
  onSignOut: () => void;
}

export default function Header({ user, onSignOut }: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  
  return (
    <header className="sticky top-0 z-50 pixel-border bg-[#232946]/80 flex items-center justify-between px-4 py-2 mb-4 shadow-lg backdrop-blur-md">
      <div className="font-bold text-lg gaming-accent pixel-font">
        <Link href="/" className="hover:text-cyan-400 transition-colors">Focusfy</Link>
      </div>
      <div className="flex items-center gap-4 relative">
        {user ? (
          <>
            <span className="text-xs pixel-font">Player: {(user as { name?: string; email?: string }).name || (user as { email?: string }).email}</span>
            <button
              className="px-3 py-1 rounded pixel-border pixel-font text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-cyan-400 hover:to-blue-500 transition-all flex items-center gap-1"
              onClick={() => setShowMenu(!showMenu)}
            >
              Settings
            </button>
            {showMenu && (
              <div className="absolute right-0 top-10 pixel-border bg-[#181825]/95 p-4 shadow-lg z-50 min-w-52">
                <div className="space-y-3">
                  <Link 
                    href="/profile" 
                    className="flex items-center gap-2 text-xs hover:text-cyan-400 pixel-font transition-colors p-2 rounded hover:bg-[#232946]/50"
                    onClick={() => setShowMenu(false)}
                  >
                    Profile Settings
                  </Link>
                  <Link 
                    href="/bot-config" 
                    className="flex items-center gap-2 text-xs hover:text-cyan-400 pixel-font transition-colors p-2 rounded hover:bg-[#232946]/50"
                    onClick={() => setShowMenu(false)}
                  >
                    Bot Configuration
                  </Link>
                  <Link 
                    href="/tests" 
                    className="flex items-center gap-2 text-xs hover:text-cyan-400 pixel-font transition-colors p-2 rounded hover:bg-[#232946]/50"
                    onClick={() => setShowMenu(false)}
                  >
                    System Tests
                  </Link>
                  <hr className="border-cyan-400/30" />
                  <button 
                    className="px-3 py-2 rounded pixel-border pixel-font text-xs w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-red-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
                    onClick={() => {
                      onSignOut();
                      setShowMenu(false);
                    }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <Link href="/signin" className="px-3 py-1 rounded pixel-border pixel-font text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-cyan-400 hover:to-blue-500 transition-all">
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
