create table players (
  id         uuid primary key default gen_random_uuid(),
  token      uuid not null unique default gen_random_uuid(),
  name       text not null,
  created_at timestamptz not null default now()
);

create table rooms (
  id         text primary key,
  host_id    uuid not null references players (id),
  status     text not null default 'lobby' check (status in ('lobby', 'playing', 'finished')),
  game       jsonb,
  created_at timestamptz not null default now()
);

create table room_members (
  room_id   text not null references rooms (id) on delete cascade,
  player_id uuid not null references players (id),
  joined_at timestamptz not null default now(),
  primary key (room_id, player_id)
);

create table messages (
  id        bigint generated always as identity primary key,
  room_id   text not null references rooms (id) on delete cascade,
  player_id uuid not null references players (id),
  text      text not null,
  sent_at   timestamptz not null default now()
);

create index messages_room_idx on messages (room_id, id desc);
