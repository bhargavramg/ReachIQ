import { useState, useEffect } from 'react';
import axios from 'axios';

export function useAppStats() {
  const [stats, setStats] = useState({
    customers: 0,
    vipCustomers: 0,
    orders: 0,
    segments: 0,
    campaigns: 0,
    averageOrderValue: 0,
    totalRevenue: 0,
    revenueFormatted: "₹0",
    openRate: "0%",
    clickRate: "0%",
    conversionRate: "0%",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const res = await axios.get(`${API_URL}/api/customers/stats`);
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load stats:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return { appMetrics: stats, loading, error };
}

export default useAppStats;
