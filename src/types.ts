export type Gender = 'M' | 'F';
export type AgeGroup = '20s' | '30s' | '40s_50s';

export interface UserProfile {
  gender: Gender;
  age: number;
  name: string;
}

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'any';

export interface Supplement {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  iconType: string;
  defaultTime: TimeOfDay;
}

export interface RoutineItem {
  id: string;
  name: string;
  timeOfDay: TimeOfDay;
  dosage: string;
  isCustom: boolean;
  createdAt: string;
}

export interface DailyRecord {
  [routineId: string]: boolean;
}

export interface HistoryLog {
  [dateStr: string]: DailyRecord;
}
