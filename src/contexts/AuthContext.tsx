"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { AuthUser, AuthContextType, Permission, ROLE_PERMISSIONS, UserRole } from "@/lib/types";

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

    // Load user from auth_user cookie (set by /api/auth/login)
    const authUserCookie = Cookies.get("auth_user");
    if (authUserCookie) {
      try {
        const storedUser = JSON.parse(authUserCookie);
        // Map LocalUser format to AuthUser format
        const authUser: AuthUser = {
          id: storedUser.id,
          email: storedUser.email || storedUser.login,
          fullName: storedUser.fullName,
          firstName: storedUser.fullName?.split(' ')[0] || storedUser.login,
          role: storedUser.role?.toLowerCase() as UserRole,
          active: storedUser.active ?? true,
          createdAt: new Date().toISOString(),
        };
        setUser(authUser);
      } catch (e) {
        console.error("Error parsing auth_user cookie:", e);
      }
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
