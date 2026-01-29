
-- ENABLE UUID EXTENSION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text,
  name text,
  role text DEFAULT 'contractor',
  active_company_id uuid,
  bio text,
  address text,
  contact jsonb DEFAULT '{"phone": "", "whatsapp": "", "website": ""}'::jsonb,
  specialties text[],
  verification_status text DEFAULT 'unverified',
  subscription_status text DEFAULT 'trial',
  wallet_balance numeric DEFAULT 0,
  referral_code text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. COMPANIES
CREATE TABLE IF NOT EXISTS public.companies (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  type text CHECK (type IN ('contractor', 'supplier', 'admin', 'logistics')),
  owner_id uuid REFERENCES auth.users NOT NULL,
  subscription_status text DEFAULT 'trial',
  verification_status text DEFAULT 'unverified',
  location text,
  coordinates jsonb DEFAULT '{"lat": -26.2041, "lon": 28.0473}'::jsonb,
  contact jsonb DEFAULT '{"phone": "", "email": "", "website": "", "whatsapp": ""}'::jsonb,
  business_hours jsonb DEFAULT '{"weekdays": "08:00-17:00", "saturday": "08:00-13:00", "sunday": "Closed"}'::jsonb,
  logo_url text,
  rating numeric DEFAULT 5.0,
  reviews_count int DEFAULT 0,
  loyalty_points int DEFAULT 0,
  loyalty_tier text DEFAULT 'Unranked',
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  contractor_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  project_name text NOT NULL,
  client_name text,
  address text,
  jurisdiction text DEFAULT 'ZA',
  standard text DEFAULT 'SANS 10400',
  status text DEFAULT 'Planning',
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 4. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  supplier_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  brand text,
  price numeric NOT NULL,
  currency text DEFAULT 'ZAR',
  stock int DEFAULT 0,
  description text,
  image_url text,
  delivery_options text[],
  discount_price numeric,
  is_contractor_listing boolean DEFAULT false,
  seller_name text,
  seller_company_id uuid REFERENCES public.companies(id),
  weight_kg numeric,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 5. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number text UNIQUE NOT NULL,
  contractor_id uuid REFERENCES public.companies(id),
  contractor_name text,
  supplier_id uuid REFERENCES public.companies(id),
  company_id uuid REFERENCES public.companies(id),
  project_id uuid REFERENCES public.projects(id),
  items jsonb DEFAULT '[]'::jsonb,
  total numeric NOT NULL,
  currency text DEFAULT 'ZAR',
  status text DEFAULT 'New',
  is_international boolean DEFAULT false,
  delivery_address text,
  delivery_details jsonb,
  proof_of_delivery jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- 6. QUOTES
CREATE TABLE IF NOT EXISTS public.quotes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  quote_number text UNIQUE NOT NULL,
  contractor_id uuid REFERENCES public.companies(id),
  contractor_name text,
  supplier_id uuid REFERENCES public.companies(id),
  project_id uuid REFERENCES public.projects(id),
  items jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'Pending',
  total numeric,
  quoted_total numeric,
  notes text,
  supplier_notes text,
  initiated_by text,
  participant_ids uuid[],
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- 7. PROJECT DETAILS (Logs, Tasks, Materials, Expenses)
CREATE TABLE IF NOT EXISTS public.project_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  type text,
  content text,
  images text[],
  date timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_tasks (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  description text NOT NULL,
  status text DEFAULT 'Pending',
  priority text DEFAULT 'Medium',
  due_date timestamp with time zone,
  start_date timestamp with time zone,
  assignee text,
  power_intensive boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_materials (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  quantity numeric DEFAULT 1,
  price_per_unit numeric DEFAULT 0,
  currency text DEFAULT 'ZAR',
  status text DEFAULT 'To Order'
);

CREATE TABLE IF NOT EXISTS public.project_expenses (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  description text,
  category text,
  amount numeric NOT NULL,
  currency text DEFAULT 'ZAR',
  date timestamp with time zone DEFAULT now()
);

-- 8. COMMUNICATIONS
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  participant_ids uuid[],
  participants_data jsonb,
  unread_by uuid,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id),
  text text NOT NULL,
  translated_text text,
  original_language text,
  timestamp timestamp with time zone DEFAULT now()
);

-- 9. LOGISTICS
CREATE TABLE IF NOT EXISTS public.vehicles (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  supplier_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  make_model text,
  registration text,
  status text DEFAULT 'Available'
);

CREATE TABLE IF NOT EXISTS public.drivers (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  supplier_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  name text,
  contact_number text
);

-- 10. AUTH TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_company_id uuid;
BEGIN
  -- Create Profile
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', COALESCE(new.raw_user_meta_data->>'role', 'contractor'));

  -- Create Default Company for the user
  INSERT INTO public.companies (name, type, owner_id)
  VALUES (COALESCE(new.raw_user_meta_data->>'company_name', new.raw_user_meta_data->>'full_name'), COALESCE(new.raw_user_meta_data->>'role', 'contractor'), new.id)
  RETURNING id INTO new_company_id;

  -- Update Profile with Active Company
  UPDATE public.profiles SET active_company_id = new_company_id WHERE id = new.id;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- DROP AND CREATE TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
