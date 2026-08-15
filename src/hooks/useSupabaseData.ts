'use client';

import * as React from 'react';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';

type QueryState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export function useSupabaseData<T>(
  table: string,
  queryFn?: (query: any) => any
): QueryState<T> & { refetch: () => void } {
  const [state, setState] = React.useState<QueryState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = React.useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const supabase = createClientSupabaseBrowser();
      let query = supabase.from(table).select('*');
      if (queryFn) {
        query = queryFn(query);
      }
      const { data, error } = await query;
      if (error) throw error;
      setState({ data: data as T, loading: false, error: null });
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : 'An error occurred',
      });
    }
  }, [table, queryFn]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}
