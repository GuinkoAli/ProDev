"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "./auth-provider";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

export function ProtectedRoute({ 
  children, 
  fallback, 
  redirectTo = "/auth/login",
  requireAuth = true 
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated, requireAuth: needsAuth } = useRequireAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && requireAuth && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, loading, requireAuth, redirectTo, router]);

  // Show loading state
  if (loading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  // If no auth required or user is authenticated, show children
  if (!requireAuth || isAuthenticated) {
    return <>{children}</>;
  }

  // Will redirect in useEffect
  return null;
}

// Higher-order component for protecting pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: { redirectTo?: string; requireAuth?: boolean } = {}
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
