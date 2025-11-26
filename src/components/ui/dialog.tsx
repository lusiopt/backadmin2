"use client";

import * as React from "react";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />

      {/* Content - Fullscreen on mobile, centered modal on desktop */}
      <div className="relative z-50 w-full h-full md:w-auto md:h-auto md:max-w-4xl md:max-h-[90vh] bg-white md:rounded-lg shadow-xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}

interface DialogContentProps {
  children: React.ReactNode;
  onClose?: () => void;
}

export function DialogContent({ children, onClose }: DialogContentProps) {
  return (
    <div className="flex flex-col h-full md:max-h-[90vh]">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-2 top-2 sm:right-4 sm:top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-10 bg-white md:bg-transparent p-1 shadow-md md:shadow-none"
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="sr-only">Close</span>
        </button>
      )}
      {children}
    </div>
  );
}

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogHeader({ children, className = "" }: DialogHeaderProps) {
  return (
    <div className={`flex flex-col space-y-1.5 px-3 sm:px-6 py-3 sm:py-4 border-b ${className}`}>
      {children}
    </div>
  );
}

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogTitle({ children, className = "" }: DialogTitleProps) {
  return (
    <h2 className={`text-lg sm:text-xl md:text-2xl font-semibold leading-none tracking-tight ${className}`}>
      {children}
    </h2>
  );
}

interface DialogBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogBody({ children, className = "" }: DialogBodyProps) {
  return (
    <div className={`flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4 ${className}`}>
      {children}
    </div>
  );
}

interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogFooter({ children, className = "" }: DialogFooterProps) {
  return (
    <div className={`flex items-center justify-end gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 border-t bg-gray-50 ${className}`}>
      {children}
    </div>
  );
}
