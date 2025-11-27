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
  const [rolePermissions, setRolePermissions] = useState<Record<string, Permission[]> | null>(null);

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

    // Load permissions from API (fonte unica de verdade)
    const loadPermissions = async () => {
      try {
        const response = await fetch("/backadmin2/api/permissions");
        const data = await response.json();
        if (data.success && data.permissions) {
          setRolePermissions(data.permissions);
        }
      } catch (e) {
        console.error("Error loading permissions from API:", e);
        // Fallback silencioso para ROLE_PERMISSIONS
      }
    };
    loadPermissions();
  }, []);

  // Helper: Get permissions for current user role
  const getRolePermissions = (role: UserRole): Permission[] => {
    // Use permissions from API if available, otherwise fallback to default
    if (rolePermissions && rolePermissions[role]) {
      return rolePermissions[role];
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
