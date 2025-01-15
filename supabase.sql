-- Function to increment clicks and update last_accessed
create or replace function increment_url_clicks(short_code_param text)
returns void
language plpgsql
security definer
as $$
begin
  update urls
  set 
    clicks = clicks + 1,
    last_accessed = now()
  where short_code = short_code_param;
end;
$$; 