'use client';

import { useAuth } from '@/lib/auth-context';
import { PermissionDialog } from '@/components/ui/permission-dialog';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: 'accessKids' | 'accessAdult' | 'accessProfessional' | 'isAdmin';
  fallbackPath?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredPermission = 'accessAdult', // Default to adult access as a general permission
  fallbackPath = '/' 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Check if user has the required permission
      const permissionGranted = user.permissions[requiredPermission];
      setHasPermission(permissionGranted);
      
      if (!permissionGranted) {
        setShowPermissionDialog(true);
      }
    } else if (!isLoading && !isAuthenticated) {
      // If not authenticated, redirect to auth page
      router.push('/auth');
    }
  }, [user, isAuthenticated, isLoading, requiredPermission, router]);

  if (isLoading) {
    // Show loading state while checking authentication
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // If user doesn't have permission, show the dialog but still render the content
  // This allows the user to see the page but be notified about the permission issue
  return (
    <>
      {children}
      <PermissionDialog
        isOpen={showPermissionDialog}
        onClose={() => {
          setShowPermissionDialog(false);
          // Optionally redirect after closing the dialog
          if (fallbackPath) {
            router.push(fallbackPath);
          }
        }}
        message={`You don't have permission to access this section. Please contact an administrator to request ${requiredPermission.replace('access', '').toLowerCase()} access.`}
      />
    </>
  );
}
