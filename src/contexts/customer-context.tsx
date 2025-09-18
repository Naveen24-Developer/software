
'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { mockCustomers } from '@/lib/data';
import type { Customer } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface CustomerContextType {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<Customer>;
  updateCustomer: (id: string, customerData: Omit<Customer, 'id' | 'createdAt'>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  getCustomerById: (id: string) => Customer | undefined;
  isLoading: boolean;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [isLoading, setIsLoading] = useState(false); // No real loading with mock data
  const { toast } = useToast();

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> => {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500));
    const newCustomer: Customer = {
      ...customerData,
      id: `CUST${(customers.length + 1).toString().padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
    };
    setCustomers(prev => [newCustomer, ...prev]);
    return newCustomer;
  };

  const updateCustomer = async (id: string, customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500));
    setCustomers(customers.map(c => (c.id === id ? { ...c, ...customerData } : c)));
  };

  const deleteCustomer = async (id: string) => {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500));
    setCustomers(customers.filter(c => c.id !== id));
  };
  
  const getCustomerById = (id: string) => {
    return customers.find(c => c.id === id);
  }

  return (
    <CustomerContext.Provider value={{ customers, addCustomer, updateCustomer, deleteCustomer, getCustomerById, isLoading }}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomers() {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
}
