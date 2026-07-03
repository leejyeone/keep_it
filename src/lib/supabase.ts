import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase configuration. Using local storage only.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Database table interfaces
export interface Profile {
  id: string;
  user_id: string;
  name: string;
  gender: 'M' | 'F';
  age: number;
  created_at: string;
  updated_at: string;
}

export interface Routine {
  id: string;
  user_id: string;
  name: string;
  time_of_day: 'morning' | 'afternoon' | 'evening';
  created_at: string;
  updated_at: string;
}

export interface HistoryEntry {
  id: string;
  user_id: string;
  date: string;
  routine_id: string;
  completed: boolean;
  created_at: string;
}

export interface UserData {
  profile: Profile | null;
  routines: Routine[];
  history: HistoryEntry[];
}

// Profile operations
export async function getOrCreateProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Profile fetch error:', error);
    return null;
  }
}

export async function updateProfile(
  userId: string,
  updates: Partial<Omit<Profile, 'id' | 'user_id' | 'created_at'>>
): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Profile update error:', error);
    return null;
  }
}

// Routines operations
export async function getUserRoutines(userId: string): Promise<Routine[]> {
  try {
    const { data, error } = await supabase
      .from('user_routines')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching routines:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Routines fetch error:', error);
    return [];
  }
}

export async function createRoutine(
  userId: string,
  routine: Omit<Routine, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<Routine | null> {
  try {
    const { data, error } = await supabase
      .from('user_routines')
      .insert({
        user_id: userId,
        ...routine,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating routine:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Routine creation error:', error);
    return null;
  }
}

export async function deleteRoutine(routineId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_routines')
      .delete()
      .eq('id', routineId);

    if (error) {
      console.error('Error deleting routine:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Routine deletion error:', error);
    return false;
  }
}

// History operations
export async function getUserHistory(userId: string): Promise<HistoryEntry[]> {
  try {
    const { data, error } = await supabase
      .from('history')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('History fetch error:', error);
    return [];
  }
}

export async function logHistory(
  userId: string,
  date: string,
  routineId: string,
  completed: boolean
): Promise<HistoryEntry | null> {
  try {
    const { data, error } = await supabase
      .from('history')
      .upsert({
        user_id: userId,
        date,
        routine_id: routineId,
        completed,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error logging history:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('History log error:', error);
    return null;
  }
}

// Sync all user data
export async function syncUserData(
  userId: string,
  profile: any,
  routines: any[],
  history: any
): Promise<boolean> {
  try {
    // Update profile
    if (profile) {
      await updateProfile(userId, {
        name: profile.name,
        gender: profile.gender,
        age: profile.age,
      });
    }

    // Sync routines
    for (const routine of routines) {
      await createRoutine(userId, {
        name: routine.name,
        time_of_day: routine.timeOfDay,
      });
    }

    // Sync history
    for (const [date, routineStatus] of Object.entries(history)) {
      for (const [routineId, completed] of Object.entries(routineStatus as Record<string, boolean>)) {
        await logHistory(userId, date, routineId, completed);
      }
    }

    return true;
  } catch (error) {
    console.error('Data sync error:', error);
    return false;
  }
}
