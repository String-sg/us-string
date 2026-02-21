-- Profiles table (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  name text,
  tagline text,
  avatar_url text,
  linkedin_url text,
  github_url text,
  website_url text,
  twitter_url text,
  is_claimed boolean default true,
  is_admin boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Products table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  github_url text,
  live_url text,
  case_study_url text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Product members junction table (user's role in a product)
create table if not exists public.product_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  role text not null,
  created_at timestamp with time zone default now(),
  unique(user_id, product_id)
);

-- Impact metrics for a user's product (each user can have different metrics for same product)
create table if not exists public.impact_metrics (
  id uuid primary key default gen_random_uuid(),
  product_member_id uuid not null references public.product_members(id) on delete cascade,
  label text not null,
  value text not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_members enable row level security;
alter table public.impact_metrics enable row level security;

-- Profiles policies
create policy "profiles_select_public" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

-- Products policies (anyone can read, creator can update/delete)
create policy "products_select_public" on public.products for select using (true);
create policy "products_insert_auth" on public.products for insert with check (auth.uid() is not null);
create policy "products_update_creator" on public.products for update using (auth.uid() = created_by);
create policy "products_delete_creator" on public.products for delete using (auth.uid() = created_by);

-- Product members policies
create policy "product_members_select_public" on public.product_members for select using (true);
create policy "product_members_insert_own" on public.product_members for insert with check (auth.uid() = user_id);
create policy "product_members_update_own" on public.product_members for update using (auth.uid() = user_id);
create policy "product_members_delete_own" on public.product_members for delete using (auth.uid() = user_id);

-- Impact metrics policies
create policy "impact_metrics_select_public" on public.impact_metrics for select using (true);
create policy "impact_metrics_insert_own" on public.impact_metrics for insert 
  with check (
    auth.uid() = (select user_id from public.product_members where id = product_member_id)
  );
create policy "impact_metrics_update_own" on public.impact_metrics for update 
  using (
    auth.uid() = (select user_id from public.product_members where id = product_member_id)
  );
create policy "impact_metrics_delete_own" on public.impact_metrics for delete 
  using (
    auth.uid() = (select user_id from public.product_members where id = product_member_id)
  );

-- Create indexes for performance
create index if not exists idx_profiles_username on public.profiles(username);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_product_members_user on public.product_members(user_id);
create index if not exists idx_product_members_product on public.product_members(product_id);
