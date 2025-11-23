CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;


--
-- Name: handle_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: itinerary_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.itinerary_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    trip_id uuid NOT NULL,
    day_number integer NOT NULL,
    title text NOT NULL,
    type text,
    "time" time without time zone,
    location text,
    description text,
    cost numeric(10,2) DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    carbon_footprint numeric(10,2) DEFAULT 0,
    transport_mode text,
    transport_distance numeric(10,2)
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text,
    full_name text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: trips; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trips (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    destination text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    budget numeric(10,2),
    interests text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: wellness_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wellness_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    motion_sickness text,
    fear_of_flights text,
    anxiety text,
    vomiting_tendency text,
    heart_sensitivity text,
    claustrophobia text,
    altitude_sensitivity text,
    mood_issues text,
    mental_wellness text,
    avoid_flights boolean DEFAULT false,
    prefer_window_seat boolean DEFAULT false,
    prefer_aisle_seat boolean DEFAULT false,
    need_frequent_breaks boolean DEFAULT false,
    need_hydration_reminders boolean DEFAULT false,
    need_calming_notifications boolean DEFAULT false,
    need_medical_alerts boolean DEFAULT false,
    need_customized_destinations boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT wellness_profiles_altitude_sensitivity_check CHECK ((altitude_sensitivity = ANY (ARRAY['none'::text, 'mild'::text, 'moderate'::text, 'severe'::text]))),
    CONSTRAINT wellness_profiles_anxiety_check CHECK ((anxiety = ANY (ARRAY['none'::text, 'mild'::text, 'moderate'::text, 'severe'::text]))),
    CONSTRAINT wellness_profiles_claustrophobia_check CHECK ((claustrophobia = ANY (ARRAY['none'::text, 'mild'::text, 'moderate'::text, 'severe'::text]))),
    CONSTRAINT wellness_profiles_fear_of_flights_check CHECK ((fear_of_flights = ANY (ARRAY['none'::text, 'mild'::text, 'moderate'::text, 'severe'::text]))),
    CONSTRAINT wellness_profiles_heart_sensitivity_check CHECK ((heart_sensitivity = ANY (ARRAY['none'::text, 'mild'::text, 'moderate'::text, 'severe'::text]))),
    CONSTRAINT wellness_profiles_mental_wellness_check CHECK ((mental_wellness = ANY (ARRAY['none'::text, 'mild'::text, 'moderate'::text, 'severe'::text]))),
    CONSTRAINT wellness_profiles_mood_issues_check CHECK ((mood_issues = ANY (ARRAY['none'::text, 'mild'::text, 'moderate'::text, 'severe'::text]))),
    CONSTRAINT wellness_profiles_motion_sickness_check CHECK ((motion_sickness = ANY (ARRAY['none'::text, 'mild'::text, 'moderate'::text, 'severe'::text]))),
    CONSTRAINT wellness_profiles_vomiting_tendency_check CHECK ((vomiting_tendency = ANY (ARRAY['none'::text, 'mild'::text, 'moderate'::text, 'severe'::text])))
);


--
-- Name: itinerary_items itinerary_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.itinerary_items
    ADD CONSTRAINT itinerary_items_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: trips trips_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_pkey PRIMARY KEY (id);


--
-- Name: wellness_profiles wellness_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wellness_profiles
    ADD CONSTRAINT wellness_profiles_pkey PRIMARY KEY (id);


--
-- Name: wellness_profiles wellness_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wellness_profiles
    ADD CONSTRAINT wellness_profiles_user_id_key UNIQUE (user_id);


--
-- Name: itinerary_items set_updated_at_itinerary_items; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at_itinerary_items BEFORE UPDATE ON public.itinerary_items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: profiles set_updated_at_profiles; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: trips set_updated_at_trips; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at_trips BEFORE UPDATE ON public.trips FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: wellness_profiles update_wellness_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_wellness_profiles_updated_at BEFORE UPDATE ON public.wellness_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: itinerary_items itinerary_items_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.itinerary_items
    ADD CONSTRAINT itinerary_items_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: trips trips_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: wellness_profiles wellness_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wellness_profiles
    ADD CONSTRAINT wellness_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: itinerary_items Users can create items for their trips; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create items for their trips" ON public.itinerary_items FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.trips
  WHERE ((trips.id = itinerary_items.trip_id) AND (trips.user_id = auth.uid())))));


--
-- Name: trips Users can create their own trips; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own trips" ON public.trips FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: itinerary_items Users can delete items for their trips; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete items for their trips" ON public.itinerary_items FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.trips
  WHERE ((trips.id = itinerary_items.trip_id) AND (trips.user_id = auth.uid())))));


--
-- Name: trips Users can delete their own trips; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own trips" ON public.trips FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: wellness_profiles Users can delete their own wellness profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own wellness profile" ON public.wellness_profiles FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: wellness_profiles Users can insert their own wellness profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own wellness profile" ON public.wellness_profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: itinerary_items Users can update items for their trips; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update items for their trips" ON public.itinerary_items FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.trips
  WHERE ((trips.id = itinerary_items.trip_id) AND (trips.user_id = auth.uid())))));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: trips Users can update their own trips; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own trips" ON public.trips FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: wellness_profiles Users can update their own wellness profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own wellness profile" ON public.wellness_profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: itinerary_items Users can view items for their trips; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view items for their trips" ON public.itinerary_items FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.trips
  WHERE ((trips.id = itinerary_items.trip_id) AND (trips.user_id = auth.uid())))));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: trips Users can view their own trips; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own trips" ON public.trips FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: wellness_profiles Users can view their own wellness profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own wellness profile" ON public.wellness_profiles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: itinerary_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: trips; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

--
-- Name: wellness_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.wellness_profiles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


