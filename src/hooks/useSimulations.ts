import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { SimulationOutput } from '@/types';

export function useSimulations(supplierId?: string) {
  return useQuery({
    queryKey: ['simulations', supplierId],
    queryFn: async (): Promise<SimulationOutput[]> => {
      let query = supabase.from('simulation_outputs').select('*');

      if (supplierId) {
        query = query.eq('supplier_id', supplierId);
      }

      const { data, error } = await query.order('simulated_at', { ascending: false });

      if (error) throw error;
      return (data as SimulationOutput[]) || [];
    },
  });
}

export function useLatestSimulation(supplierId: string) {
  return useQuery({
    queryKey: ['simulations', supplierId, 'latest'],
    queryFn: async (): Promise<SimulationOutput | null> => {
      const { data, error } = await supabase
        .from('simulation_outputs')
        .select('*')
        .eq('supplier_id', supplierId)
        .order('simulated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) return null;
      return data as SimulationOutput;
    },
    enabled: !!supplierId,
  });
}
