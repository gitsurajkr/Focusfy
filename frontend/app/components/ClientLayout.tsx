"use client";
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthPage = pathname === '/signin' || pathname === '/signup';
  const isProtectedPage = pathname === '/settings' || pathname === '/';

  useEffect(() => {
    if (!loading) {
      // Redirect to signin if not authenticated and trying to access protected pages
      if (!user && isProtectedPage && !isAuthPage) {
        router.push('/signin');
      }
      // Redirect to home if authenticated and on auth pages
      if (user && isAuthPage) {
        router.push('/');
      }
    }
  }, [user, loading, pathname, router, isAuthPage, isProtectedPage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="minecraft-card p-8">
          <div className="text-center">Loading Focusfy...</div>
        </div>
      </div>
    );
  }

  // Don't show header on auth pages
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Header user={user} onSignOut={logout} />
      {children}
    </>
  );
}
