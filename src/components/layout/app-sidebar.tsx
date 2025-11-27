"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  FileText,
  Settings,
  BarChart3,
} from "lucide-react";

import { NavMain } from "@/components/layout/nav-main";
import { NavUser } from "@/components/layout/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Permission } from "@/lib/types";

const navItems = [
  {
    title: "Processos",
    url: "/",
    icon: FileText,
    isActive: true,
  },
  {
    title: "Relatorios",
    url: "/relatorios",
    icon: BarChart3,
  },
  {
    title: "Configuracoes",
    url: "/configuracoes",
    icon: Settings,
    permission: Permission.MANAGE_USERS,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, hasPermission } = useAuth();

  // Não mostrar sidebar na página de login
  if (pathname?.includes('/login')) {
    return null;
  }

  // Filter nav items based on permissions
  const filteredNavItems = navItems.filter((item) => {
    if (item.permission) {
      return hasPermission(item.permission);
    }
    return true;
  }).map((item) => ({
    ...item,
    isActive: pathname === item.url,
  }));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              onClick={() => router.push("/")}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white overflow-hidden">
                <img
                  src="/backadmin2/logo-lusio.jpeg"
                  alt="Lusio"
                  width={32}
                  height={32}
                  className="size-8 object-cover"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Lusio Cidadania</span>
                <span className="truncate text-xs text-muted-foreground">Gestao de Processos</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
