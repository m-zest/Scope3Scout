import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Violation } from '@/types';

export function useViolations(supplierId?: string) {
  return useQuery({
    queryKey: ['violations', supplierId],
    queryFn: async (): Promise<Violation[]> => {
      let query = supabase.from('violations').select('*');

      if (supplierId) {
        query = query.eq('supplier_id', supplierId);
      }

      const { data, error } = await query.order('found_at', { ascending: false });

      if (error) throw error;
      return (data as Violation[]) || [];
    },
  });
}
