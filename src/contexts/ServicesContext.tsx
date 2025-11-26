"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { mockServices as initialMockServices } from "@/lib/mockData";
import { Service, ServiceStatus } from "@/lib/types";

interface ServicesContextType {
  services: Service[];
  updateService: (id: string, updates: Partial<Service>) => void;
  getService: (id: string) => Service | undefined;
}

const ServicesContext = createContext<ServicesContextType | undefined>(undefined);

export function ServicesProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<Service[]>(initialMockServices);

  const updateService = (id: string, updates: Partial<Service>) => {
    setServices((prevServices) =>
      prevServices.map((service) =>
        service.id === id ? { ...service, ...updates } : service
      )
    );
  };

  const getService = (id: string) => {
    return services.find((s) => s.id === id);
  };

  return (
    <ServicesContext.Provider value={{ services, updateService, getService }}>
      {children}
    </ServicesContext.Provider>
  );
}

export function useServices() {
  const context = useContext(ServicesContext);
  if (context === undefined) {
    throw new Error("useServices must be used within a ServicesProvider");
  }
  return context;
}
