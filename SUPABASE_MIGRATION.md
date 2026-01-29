# StockLink Ferrari | Master SQL Schema

Copy and paste the entire block below into your Supabase **SQL Editor** and click **Run**.

```sql
-- 0. ENABLE EXTENSIONS
create extension if not exists "uuid-ossp";

-- 1. PROFILES (USER METADATA)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  name text,
  role text,
  active_company_id uuid,
  verification_status text default 'unverified',
  subscription_status text default 'trial',
  referral_code text,
  wallet_balance numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. COMPANIES
create table if not exists public.companies (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  type text check (type in ('contractor', 'supplier', 'admin', 'logistics')),
  owner_id uuid references auth.users not null,
  subscription_status text default 'trial',
  location text,
  coordinates jsonb,
  contact jsonb,
  business_hours jsonb,
  loyalty_points int default 0,
  loyalty_tier text default 'Unranked',
  rating numeric default 5.0,
  reviews_count int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. PRODUCTS
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  supplier_id uuid references public.companies(id),
  name text not null,
  category text,
  brand text,
  price numeric not null,
  stock int default 0,
  description text,
  image_url text,
  delivery_options text[],
  discount_price numeric,
  is_contractor_listing boolean default false,
  seller_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. PROJECTS
create table if not exists public.projects (
  id uuid default uuid_generate_v4() primary key,
  contractor_id uuid references public.companies(id),
  project_name text not null,
  client_name text,
  address text,
  jurisdiction text default 'ZA',
  standard text default 'SANS 10400',
  status text default 'Planning',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. ORDERS & QUOTES
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  order_number text unique,
  contractor_id uuid references public.companies(id),
  supplier_id uuid references public.companies(id),
  project_id uuid references public.projects(id),
  contractor_name text,
  items jsonb,
  total numeric,
  status text default 'New',
  delivery_details jsonb,
  delivery_address text,
  proof_of_delivery jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.quotes (
  id uuid default uuid_generate_v4() primary key,
  quote_number text unique,
  contractor_id uuid references public.companies(id),
  supplier_id uuid references public.companies(id),
  project_id uuid references public.projects(id),
  items jsonb,
  status text default 'Pending',
  total numeric,
  quoted_total numeric,
  notes text,
  supplier_notes text,
  initiated_by text,
  participant_ids uuid[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. PROJECT DATA NODES
create table if not exists public.project_logs (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id),
  type text,
  content text,
  images text[],
  date timestamp with time zone default now()
);

create table if not exists public.project_materials (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id),
  product_name text,
  quantity numeric,
  price_per_unit numeric,
  status text default 'To Order',
  created_at timestamp with time zone default now()
);

create table if not exists public.project_expenses (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id),
  description text,
  category text,
  amount numeric,
  date timestamp with time zone default now()
);

create table if not exists public.project_tasks (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id),
  description text,
  status text default 'Pending',
  priority text default 'Medium',
  due_date timestamp with time zone,
  assignee text,
  power_intensive boolean default false
);

create table if not exists public.project_milestones (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id),
  title text,
  amount numeric,
  status text default 'Locked',
  description text,
  verification_type text default 'Manual'
);

-- 7. LOGISTICS & FLEET
create table if not exists public.vehicles (
  id uuid default uuid_generate_v4() primary key,
  supplier_id uuid references public.companies(id),
  make_model text,
  registration text,
  status text default 'Available'
);

create table if not exists public.drivers (
  id uuid default uuid_generate_v4() primary key,
  supplier_id uuid references public.companies(id),
  name text,
  contact_number text
);

create table if not exists public.logistics_loads (
  id uuid default uuid_generate_v4() primary key,
  order_number text,
  supplier_name text,
  payout numeric,
  pickup_location text,
  dropoff_location text,
  required_vehicle_type text,
  status text default 'Available'
);

-- 8. COMMUNICATIONS
create table if not exists public.conversations (
  id uuid default uuid_generate_v4() primary key,
  participant_ids uuid[],
  participants_data jsonb,
  unread_by uuid,
  created_at timestamp with time zone default now()
);

create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id),
  sender_id uuid,
  text text,
  translated_text text,
  original_language text,
  timestamp timestamp with time zone default now()
);

-- 9. AUTH TRIGGER FOR PROFILES & INITIAL COMPANY
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_company_id uuid;
begin
  -- 1. Insert Profile
  insert into public.profiles (id, email, name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'role');

  -- 2. Create Initial Company
  insert into public.companies (name, type, owner_id)
  values (new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'role', new.id)
  returning id into new_company_id;

  -- 3. Update profile with active company
  update public.profiles set active_company_id = new_company_id where id = new.id;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 10. POLICIES (Simplified for Launch)
alter table public.profiles enable row level security;
create policy "Users can view all profiles" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

alter table public.companies enable row level security;
create policy "Companies are public" on public.companies for select using (true);
create policy "Owners manage companies" on public.companies for all using (auth.uid() = owner_id);

alter table public.products enable row level security;
create policy "Products are public" on public.products for select using (true);
create policy "Suppliers manage products" on public.products for all using (auth.uid() in (select owner_id from companies where id = supplier_id));
```
