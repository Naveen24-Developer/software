// lib/hooks/use-products.ts
import { useState, useEffect } from 'react';
import type { Product, ProductFormData, ApiResponse } from '@/lib/db/schema';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      const result: ApiResponse<Product[]> = await response.json();
      
      if (result.success && result.data) {
        setProducts(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch products');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (data: ProductFormData): Promise<Product | null> => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result: ApiResponse<Product> = await response.json();
      
      if (result.success && result.data) {
        setProducts(prev => [result.data!, ...prev]);
        return result.data;
      } else {
        setError(result.error || 'Failed to create product');
        return null;
      }
    } catch (err) {
      setError('Network error occurred');
      return null;
    }
  };

  const updateProduct = async (id: string, data: ProductFormData): Promise<boolean> => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result: ApiResponse<Product> = await response.json();
      
      if (result.success && result.data) {
        setProducts(prev => prev.map(p => p.id === id ? result.data! : p));
        setError(null);
        return true;
      } else {
        setError(result.error || 'Failed to update product');
        return false;
      }
    } catch (err) {
      setError('Network error occurred');
      return false;
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      
      const result: ApiResponse<any> = await response.json();
      
      if (result.success) {
        setProducts(prev => prev.filter(p => p.id !== id));
        setError(null);
        return true;
      } else {
        setError(result.error || 'Failed to delete product');
        return false;
      }
    } catch (err) {
      setError('Network error occurred');
      return false;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
  };
}
