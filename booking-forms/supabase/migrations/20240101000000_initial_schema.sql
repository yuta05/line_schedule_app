-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create stores table
create table stores (
  id text primary key,
  name text not null,
  description text,
  phone text,
  email text,
  address text,
  business_hours jsonb,
  settings jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create forms table
create table forms (
  id text primary key,
  store_id text not null references stores(id) on delete cascade,
  name text not null,
  description text,
  menu_structure jsonb not null default '[]',
  business_rules jsonb not null default '{}',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create reservations table
create table reservations (
  id text primary key,
  form_id text not null references forms(id) on delete cascade,
  store_id text not null references stores(id) on delete cascade,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  reservation_date date not null,
  reservation_time time not null,
  menu_selections jsonb not null default '[]',
  total_amount integer not null default 0,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index idx_forms_store_id on forms(store_id);
create index idx_reservations_form_id on reservations(form_id);
create index idx_reservations_store_id on reservations(store_id);
create index idx_reservations_date on reservations(reservation_date);
create index idx_reservations_status on reservations(status);

-- Create updated_at trigger function
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger stores_updated_at_trigger
  before update on stores
  for each row execute function handle_updated_at();

create trigger forms_updated_at_trigger
  before update on forms
  for each row execute function handle_updated_at();

create trigger reservations_updated_at_trigger
  before update on reservations
  for each row execute function handle_updated_at();
