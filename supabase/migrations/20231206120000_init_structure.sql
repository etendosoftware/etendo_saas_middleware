-- Creación de la extensión necesaria para gen_random_uuid() si aún no existe
create extension if not exists pgcrypto;

-- Tabla profiles
create table if not exists public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null,
    name text,
    email text unique,
    avatar_url text
);

-- Trigger para updated_at
create or replace function public.set_timestamp() returns trigger as $$
begin
  new.updated_at = now();
return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
    before update on public.profiles
    for each row
    execute procedure public.set_timestamp();

-- Tabla environments
create table if not exists public.environments (
    id uuid primary key default gen_random_uuid(),
    created_at timestamp with time zone default now() not null,
    created_by uuid not null references public.profiles (id) on delete cascade,
    name text not null,
    description text
);