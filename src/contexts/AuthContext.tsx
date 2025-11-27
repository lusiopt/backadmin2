"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthUser, AuthContextType, Permission, ROLE_PERMISSIONS, UserRole } from "@/lib/types";
import { authStorage } from "@/lib/services/auth";

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [customPermissions, setCustomPermissions] = useState<Record<UserRole, Permission[]> | null>(null);

  // Load user from Cookies on mount
  useEffect(() => {
    setIsMounted(true);

    // Load user from Cookies (set by authService.login)
    const storedUser = authStorage.getUser();
    if (storedUser) {
      // Map the API user format to AuthUser format
      const authUser: AuthUser = {
        id: storedUser.id,
        email: storedUser.email,
        fullName: storedUser.name || storedUser.email,
        firstName: storedUser.name?.split(' ')[0] || storedUser.email.split('@')[0],
        role: (storedUser.role as UserRole) || UserRole.BACKOFFICE,
        active: true,
        createdAt: new Date().toISOString(),
      };
      setUser(authUser);
    }

    // Load custom permissions configuration
    const storedPermissions = localStorage.getItem("role_permissions_config");
    if (storedPermissions) {
      try {
        const parsed = JSON.parse(storedPermissions);
        setCustomPermissions(parsed);
      } catch (e) {
        console.error("Error loading custom permissions:", e);
      }
    }
  }, []);

  // Helper: Get permissions for current user role
  const getRolePermissions = (role: UserRole): Permission[] => {
    // Use custom permissions if available, otherwise fallback to default
    if (customPermissions && customPermissions[role]) {
      return customPermissions[role];
    }
    return ROLE_PERMISSIONS[role];
  };

  // Helper: Check if user has a specific permission
  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    const permissions = getRolePermissions(user.role);
    return permissions.includes(permission);
  };

  // Helper: Check if user has ANY of the permissions
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return permissions.some((p) => hasPermission(p));
  };

  // Helper: Check if user has ALL permissions
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return permissions.every((p) => hasPermission(p));
  };

  const value: AuthContextType = {
    user,
    setUser,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
