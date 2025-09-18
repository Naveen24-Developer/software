// lib/hooks/use-customers.ts
import { useState, useEffect } from 'react';
import type { Customer, CustomerFormData, ApiResponse } from '@/lib/db/schema';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/customers');
      const result: ApiResponse<Customer[]> = await response.json();
      
      if (result.success && result.data) {
        setCustomers(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch customers');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (data: CustomerFormData): Promise<Customer | null> => {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result: ApiResponse<Customer> = await response.json();
      
      if (result.success && result.data) {
        setCustomers(prev => [result.data!, ...prev]);
        return result.data;
      } else {
        setError(result.error || 'Failed to create customer');
        return null;
      }
    } catch (err) {
      setError('Network error occurred');
      return null;
    }
  };

  const updateCustomer = async (id: string, data: CustomerFormData): Promise<boolean> => {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result: ApiResponse<Customer> = await response.json();
      
      if (result.success && result.data) {
        setCustomers(prev => prev.map(c => c.id === id ? result.data! : c));
        setError(null);
        return true;
      } else {
        setError(result.error || 'Failed to update customer');
        return false;
      }
    } catch (err) {
      setError('Network error occurred');
      return false;
    }
  };

  const deleteCustomer = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      });
      
      const result: ApiResponse<any> = await response.json();
      
      if (result.success) {
        setCustomers(prev => prev.filter(c => c.id !== id));
        setError(null);
        return true;
      } else {
        setError(result.error || 'Failed to delete customer');
        return false;
      }
    } catch (err) {
      setError('Network error occurred');
      return false;
    }
  };

  const getCustomerById = (id: string): Customer | undefined => {
    return customers.find(c => c.id === id);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById,
  };
}