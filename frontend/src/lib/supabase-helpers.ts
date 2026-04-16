import { supabase } from '@/integrations/supabase/client';
import type { Vulnerability } from './scan-data';
import { getGrade } from './scan-data';

export async function saveScanToDb(
  userId: string,
  url: string,
  score: number,
  vulnerabilities: Vulnerability[]
) {
  const { error } = await supabase.from('scans').insert({
    user_id: userId,
    url,
    score,
    grade: getGrade(score),
    hosting_type: 'Apache',
    vulnerabilities: vulnerabilities as any,
  });
  if (error) console.error('Error saving scan:', error);
}

export async function fetchUserScans() {
  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching scans:', error);
    return [];
  }
  return data;
}

export async function getGlobalScanCount(): Promise<number> {
  const { data, error } = await supabase
    .from('global_counters')
    .select('value')
    .eq('id', 'total_scans')
    .single();

  if (error) {
    console.error('Error fetching counter:', error);
    return 10247;
  }
  return data.value;
}

export async function incrementScanCounter(): Promise<number> {
  const { data, error } = await supabase.rpc('increment_counter', {
    counter_id: 'total_scans',
    increment_by: 1,
  });

  if (error) {
    console.error('Error incrementing counter:', error);
    return 0;
  }
  return data;
}

export function subscribeToCounter(callback: (value: number) => void) {
  const channel = supabase
    .channel('global_counters_changes')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'global_counters', filter: 'id=eq.total_scans' },
      (payload) => {
        callback(payload.new.value as number);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
