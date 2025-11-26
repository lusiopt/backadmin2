"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { mockSystemUsers } from "@/lib/mockData";
import { UserRole } from "@/lib/types";
import { User, ChevronDown, Check, Shield, Eye, Briefcase, Crown } from "lucide-react";

const roleIcons = {
  [UserRole.ADMIN]: Crown,
  [UserRole.BACKOFFICE]: Briefcase,
  [UserRole.ADVOGADA]: Shield,
  [UserRole.VISUALIZADOR]: Eye,
};

const roleColors = {
  [UserRole.ADMIN]: "bg-purple-100 text-purple-700 border-purple-300",
  [UserRole.BACKOFFICE]: "bg-blue-100 text-blue-700 border-blue-300",
  [UserRole.ADVOGADA]: "bg-green-100 text-green-700 border-green-300",
  [UserRole.VISUALIZADOR]: "bg-gray-100 text-gray-700 border-gray-300",
};

const roleLabels = {
  [UserRole.ADMIN]: "Admin",
  [UserRole.BACKOFFICE]: "Backoffice",
  [UserRole.ADVOGADA]: "Advogada",
  [UserRole.VISUALIZADOR]: "Visualizador",
};

export function ProfileSwitcher() {
  const { user, setUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Only render on client-side to avoid SSR issues
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !user) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-gray-100 text-gray-400 text-sm">
        <div className="w-4 h-4 animate-pulse bg-gray-300 rounded"></div>
        <span className="text-xs">Carregando...</span>
      </div>
    );
  }

  const RoleIcon = roleIcons[user.role];

  return (
    <div className="relative">
      {/* Current User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border ${
          roleColors[user.role]
        } hover:opacity-80 transition-opacity text-sm font-medium`}
      >
        <RoleIcon className="w-3 h-3 sm:w-4 sm:h-4" />
        <div className="flex flex-col items-start">
          <span className="text-xs opacity-75 hidden sm:inline">Perfil Atual</span>
          <span className="font-semibold text-xs sm:text-sm">{roleLabels[user.role]}</span>
        </div>
        <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Menu */}
          <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Trocar Perfil (Dev Mode)
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Selecione um perfil para testar permissões
              </p>
            </div>

            {/* User List */}
            <div className="py-2">
              {mockSystemUsers.map((systemUser) => {
                const Icon = roleIcons[systemUser.role];
                const isActive = user.id === systemUser.id;

                return (
                  <button
                    key={systemUser.id}
                    onClick={() => {
                      setUser(systemUser);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                      isActive ? "bg-blue-50" : ""
                    }`}
                  >
                    {/* Role Icon */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        roleColors[systemUser.role]
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* User Info */}
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-gray-900">{systemUser.fullName}</p>
                      <p className="text-xs text-gray-500">{systemUser.email}</p>
                      <p className="text-xs font-medium text-gray-600 mt-0.5">
                        {roleLabels[systemUser.role]}
                      </p>
                    </div>

                    {/* Check Icon */}
                    {isActive && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-200">
              <p className="text-xs text-yellow-800">
                <span className="font-semibold">⚠️ Modo Desenvolvimento</span>
                <br />
                Esse componente só aparece em ambiente dev.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
