create table public.events (
  id bigserial primary key,
  event_url text not null,
  shop_name text not null,
  fee integer not null,
  capacity integer not null,
  reg_end timestamptz not null,
  tags text[],
  created_at timestamptz default now()
);