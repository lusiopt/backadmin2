"use client";

import { Bell, RefreshCw, Search, MessageSquare, ChevronDown, Filter, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/pedidos/status-badge";
import { NotificationPanel } from "@/components/NotificationPanel";
import { Service, ServiceStatus, ServiceWithRelations } from "@/lib/types";

interface HeaderProps {
  // Search
  searchInput: string;
  setSearchInput: (value: string) => void;
  search: string;
  setSearch: (value: string) => void;

  // Refresh
  isRefreshing: boolean;
  onRefresh: () => void;

  // Status Filter
  uniqueStatuses: (string | null)[];
  selectedStatuses: string[];
  setSelectedStatuses: (statuses: string[]) => void;

  // Date Filter
  dateFrom: string;
  setDateFrom: (value: string) => void;
  dateTo: string;
  setDateTo: (value: string) => void;

  // Pending Communications
  showPendingCommunications: boolean;
  setShowPendingCommunications: (value: boolean) => void;
  servicesWithNotifications: Service[];

  // Notifications
  totalUnreadMessages: number;
  services: Service[];
  currentUserId?: string;
  onOpenService: (serviceId: string) => void;
}

export function Header({
  searchInput,
  setSearchInput,
  search,
  setSearch,
  isRefreshing,
  onRefresh,
  uniqueStatuses,
  selectedStatuses,
  setSelectedStatuses,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  showPendingCommunications,
  setShowPendingCommunications,
  servicesWithNotifications,
  totalUnreadMessages,
  services,
  currentUserId,
  onOpenService,
}: HeaderProps) {
  return (
    <header className="flex h-auto flex-col gap-2 border-b bg-background px-4 py-3">
      {/* Top Row: Breadcrumb + Actions */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Processos</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto flex items-center gap-2">
          {/* Refresh */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-8 w-8"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                <Bell className="h-4 w-4" />
                {totalUnreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[9px] font-bold bg-destructive text-destructive-foreground rounded-full">
                    {totalUnreadMessages > 99 ? "99+" : totalUnreadMessages}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              {currentUserId && (
                <NotificationPanel
                  services={services}
                  currentUserId={currentUserId}
                  onClose={() => {}}
                  onOpenService={onOpenService}
                  embedded
                />
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Search and Filters Row */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search */}
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por nome, email ou ID..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSearch(searchInput);
                }
              }}
              className="pl-10 h-9"
            />
          </div>
          <Button onClick={() => setSearch(searchInput)} size="sm" className="h-9">
            Buscar
          </Button>
          {search && (
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => {
                setSearch("");
                setSearchInput("");
              }}
            >
              Limpar
            </Button>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Pending Communications */}
          <Button
            variant={showPendingCommunications ? "default" : "outline"}
            size="sm"
            className="h-9"
            onClick={() => setShowPendingCommunications(!showPendingCommunications)}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Comunicacoes</span>
            {showPendingCommunications && servicesWithNotifications.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {servicesWithNotifications.length}
              </Badge>
            )}
          </Button>

          {/* Status Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="h-4 w-4 mr-1" />
                Status
                {selectedStatuses.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {selectedStatuses.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4" align="end">
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {uniqueStatuses.map((status) => (
                  <label
                    key={status || "none"}
                    className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded"
                  >
                    <Checkbox
                      checked={status ? selectedStatuses.includes(status) : false}
                      onCheckedChange={(checked) => {
                        if (checked && status) {
                          setSelectedStatuses([...selectedStatuses, status]);
                        } else {
                          setSelectedStatuses(selectedStatuses.filter((s) => s !== status));
                        }
                      }}
                    />
                    <StatusBadge status={status as ServiceStatus} />
                  </label>
                ))}
              </div>
              {selectedStatuses.length > 0 && (
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => setSelectedStatuses([])}
                >
                  Limpar filtros
                </Button>
              )}
            </PopoverContent>
          </Popover>

          {/* Date Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Calendar className="h-4 w-4 mr-1" />
                Datas
                {(dateFrom || dateTo) && (
                  <span className="ml-1 w-2 h-2 bg-primary rounded-full" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="end">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">De:</label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Ate:</label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="h-9"
                  />
                </div>
                {(dateFrom || dateTo) && (
                  <Button
                    variant="link"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setDateFrom("");
                      setDateTo("");
                    }}
                  >
                    Limpar datas
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}
