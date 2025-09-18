// lib/hooks/use-vehicles.ts
import { useState, useEffect } from 'react';
import type { Vehicle, ApiResponse } from '@/lib/db/schema';

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/vehicles');
      const result: ApiResponse<Vehicle[]> = await response.json();
      
      if (result.success && result.data) {
        setVehicles(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch vehicles');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return {
    vehicles,
    loading,
    error,
    fetchVehicles,
  };
}