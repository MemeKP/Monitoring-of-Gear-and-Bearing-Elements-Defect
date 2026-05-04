import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";

export function useDashboardStats() {
  const [data, setData]       = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetch_() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/dashboard/stats`, {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const json = await res.json();
        setData(json.data);

        setLoading(false);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } 
    }

    fetch_();
    return () => controller.abort();   
  }, []);

  return { data, loading, error };
}