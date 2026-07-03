import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

interface SupabaseContextType {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsLoading(true);
        
        // Try to fetch config from server
        const response = await fetch('/api/config');
        const data = await response.json();
        
        if (data.supabaseConfigured) {
          setIsConnected(true);
          setError(null);
          console.log('✅ Supabase connected successfully');
        } else {
          setIsConnected(false);
          console.warn('⚠️ Supabase not configured. Using local storage only.');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to check Supabase connection';
        setError(errorMessage);
        console.error('❌ Supabase connection error:', errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  return (
    <SupabaseContext.Provider value={{ isConnected, isLoading, error }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within SupabaseProvider');
  }
  return context;
}
