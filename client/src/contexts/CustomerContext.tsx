import { createContext, useContext, useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

type CustomerProfile = {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  totalOrders: number;
  totalSpent: string;
  createdAt: Date;
  updatedAt: Date;
  passwordHash?: string | null;
  notes?: string | null;
};

interface CustomerContextValue {
  customer: CustomerProfile | null;
  isLoading: boolean;
  refetch: () => void;
}

const CustomerContext = createContext<CustomerContextValue>({
  customer: null,
  isLoading: false,
  refetch: () => {},
});

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, refetch } = trpc.customerAuth.me.useQuery(undefined, {
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <CustomerContext.Provider value={{ customer: data as CustomerProfile | null, isLoading, refetch }}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  return useContext(CustomerContext);
}
