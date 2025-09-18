// lib/hooks/use-orders.ts
import { useState, useEffect } from 'react';
import type { Order, OrderFormData, ApiResponse } from '@/lib/db/schema';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      const result: ApiResponse<Order[]> = await response.json();
      
      if (result.success && result.data) {
        setOrders(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch orders');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (data: OrderFormData): Promise<Order | null> => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result: ApiResponse<Order> = await response.json();
      
      if (result.success && result.data) {
        setOrders(prev => [result.data!, ...prev]);
        return result.data;
      } else {
        setError(result.error || 'Failed to create order');
        return null;
      }
    } catch (err) {
      setError('Network error occurred');
      return null;
    }
  };

  const updateOrderStatus = async (id: string, status: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      const result: ApiResponse<Order> = await response.json();
      
      if (result.success && result.data) {
        setOrders(prev => prev.map(o => o.id === id ? result.data! : o));
        setError(null);
        return true;
      } else {
        setError(result.error || 'Failed to update order');
        return false;
      }
    } catch (err) {
      setError('Network error occurred');
      return false;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
    updateOrderStatus,
  };
}