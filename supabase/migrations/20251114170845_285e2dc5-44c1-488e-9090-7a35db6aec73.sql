-- Create wellness_profiles table
CREATE TABLE public.wellness_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Conditions with severity
  motion_sickness TEXT CHECK (motion_sickness IN ('none', 'mild', 'moderate', 'severe')),
  fear_of_flights TEXT CHECK (fear_of_flights IN ('none', 'mild', 'moderate', 'severe')),
  anxiety TEXT CHECK (anxiety IN ('none', 'mild', 'moderate', 'severe')),
  vomiting_tendency TEXT CHECK (vomiting_tendency IN ('none', 'mild', 'moderate', 'severe')),
  heart_sensitivity TEXT CHECK (heart_sensitivity IN ('none', 'mild', 'moderate', 'severe')),
  claustrophobia TEXT CHECK (claustrophobia IN ('none', 'mild', 'moderate', 'severe')),
  altitude_sensitivity TEXT CHECK (altitude_sensitivity IN ('none', 'mild', 'moderate', 'severe')),
  mood_issues TEXT CHECK (mood_issues IN ('none', 'mild', 'moderate', 'severe')),
  mental_wellness TEXT CHECK (mental_wellness IN ('none', 'mild', 'moderate', 'severe')),
  
  -- Preferences
  avoid_flights BOOLEAN DEFAULT false,
  prefer_window_seat BOOLEAN DEFAULT false,
  prefer_aisle_seat BOOLEAN DEFAULT false,
  need_frequent_breaks BOOLEAN DEFAULT false,
  need_hydration_reminders BOOLEAN DEFAULT false,
  need_calming_notifications BOOLEAN DEFAULT false,
  need_medical_alerts BOOLEAN DEFAULT false,
  need_customized_destinations BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.wellness_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own wellness profile"
ON public.wellness_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wellness profile"
ON public.wellness_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wellness profile"
ON public.wellness_profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wellness profile"
ON public.wellness_profiles
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_wellness_profiles_updated_at
BEFORE UPDATE ON public.wellness_profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();