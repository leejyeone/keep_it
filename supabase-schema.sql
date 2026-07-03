-- Supabase Database Schema for Keep It App
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('M', 'F')),
  age INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- User Routines table
CREATE TABLE IF NOT EXISTS user_routines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  time_of_day TEXT NOT NULL CHECK (time_of_day IN ('morning', 'afternoon', 'evening')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE
);

-- History table
CREATE TABLE IF NOT EXISTS history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  routine_id TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE,
  UNIQUE(user_id, date, routine_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (TRUE);

-- RLS Policies for user_routines
CREATE POLICY "Users can view all routines" ON user_routines
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert routines" ON user_routines
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Users can update routines" ON user_routines
  FOR UPDATE USING (TRUE);

CREATE POLICY "Users can delete routines" ON user_routines
  FOR DELETE USING (TRUE);

-- RLS Policies for history
CREATE POLICY "Users can view all history" ON history
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert history" ON history
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Users can update history" ON history
  FOR UPDATE USING (TRUE);

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_user_routines_user_id ON user_routines(user_id);
CREATE INDEX idx_history_user_id ON history(user_id);
CREATE INDEX idx_history_date ON history(date);
