-- Run in Supabase SQL editor to support structured config fields.
alter table community_configs
  add column if not exists thumbnail_url text,
  add column if not exists weapon_percentages text,
  add column if not exists map_playlist_codes text,
  add column if not exists genre_tags text[] default '{}';

-- Optional: public bucket for uploaded thumbnails
-- insert into storage.buckets (id, name, public) values ('config-thumbnails', 'config-thumbnails', true);
