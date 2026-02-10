-- ================================================
-- SUNUPARKING - Schema SQL pour Supabase
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- Table: profiles (extension de auth.users)
-- ================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- Table: vehicles
-- ================================================
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  matricule TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'Disponible' CHECK (status IN ('Disponible', 'Réservé', 'En panne', 'Hors service')),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- Table: reservations
-- ================================================
CREATE TABLE IF NOT EXISTS reservations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  end_at TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'En attente' CHECK (status IN ('En attente', 'Confirmée', 'Annulée')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (end_at > start_at)
);

-- ================================================
-- Indexes pour performances
-- ================================================
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_reservations_vehicle_id ON reservations(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(start_at, end_at);

-- ================================================
-- Row Level Security (RLS) Policies
-- ================================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Vehicles Policies
CREATE POLICY "Vehicles are viewable by authenticated users"
  ON vehicles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert vehicles"
  ON vehicles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update vehicles"
  ON vehicles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete vehicles"
  ON vehicles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Reservations Policies
CREATE POLICY "Reservations are viewable by authenticated users"
  ON reservations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own reservations"
  ON reservations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reservations"
  ON reservations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ));

CREATE POLICY "Users can delete their own reservations"
  ON reservations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ));

-- ================================================
-- Triggers pour updated_at
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- Fonction pour créer automatiquement le profil
-- ================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer le profil automatiquement
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ================================================
-- Données de test (optionnel)
-- ================================================

-- Exemple de véhicules
INSERT INTO vehicles (name, matricule, type, status, image_url) VALUES
  ('Toyota Corolla', 'DK-1234-AB', 'Berline', 'Disponible', ''),
  ('Nissan Patrol', 'DK-5678-CD', 'SUV', 'Disponible', ''),
  ('Ford Transit', 'DK-9012-EF', 'Mini-bus', 'En panne', ''),
  ('Peugeot 308', 'DK-3456-GH', 'Berline', 'Disponible', ''),
  ('Renault Kangoo', 'DK-7890-IJ', 'Utilitaire', 'Hors service', '')
ON CONFLICT (matricule) DO NOTHING;

-- ================================================
-- Storage Bucket pour les images
-- ================================================
-- À exécuter dans la console Supabase Storage:
-- 1. Créer un bucket nommé "images"
-- 2. Le rendre public
-- 3. Définir les policies suivantes:

-- Policy pour upload (authenticated users)
-- CREATE POLICY "Authenticated users can upload images"
--   ON storage.objects FOR INSERT
--   TO authenticated
--   WITH CHECK (bucket_id = 'images');

-- Policy pour read (public)
-- CREATE POLICY "Public can view images"
--   ON storage.objects FOR SELECT
--   TO public
--   USING (bucket_id = 'images');

-- Policy pour delete (admins only)
-- CREATE POLICY "Only admins can delete images"
--   ON storage.objects FOR DELETE
--   TO authenticated
--   USING (
--     bucket_id = 'images' AND
--     EXISTS (
--       SELECT 1 FROM profiles
--       WHERE profiles.id = auth.uid()
--       AND profiles.role = 'admin'
--     )
--   );
