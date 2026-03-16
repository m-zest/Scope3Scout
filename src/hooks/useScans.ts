import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Scan } from '@/types';

export function useScans() {
  return useQuery({
    queryKey: ['scans'],
    queryFn: async (): Promise<Scan[]> => {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .order('started_at', { ascending: false });

      if (error) throw error;
      return (data as Scan[]) || [];
    },
  });
}

export function useLatestScan() {
  return useQuery({
    queryKey: ['scans', 'latest'],
    queryFn: async (): Promise<Scan | null> => {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (error) return null;
      return data as Scan;
    },
  });
}
