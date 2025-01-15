# Telegram URL Shortener Bot

A Telegram bot that shortens URLs and tracks click analytics using Supabase as the backend.

## Features

- Shorten URLs with custom short codes
- Track click analytics
- View URL statistics
- Easy to deploy on Render

## Prerequisites

- Node.js 16+
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- Supabase account and project

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   BOT_TOKEN=your_telegram_bot_token
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   BASE_URL=your_base_url
   ```

4. Set up Supabase:
   - Create a new table named `urls` with the following schema:
     ```sql
     create table urls (
       id uuid default uuid_generate_v4() primary key,
       original_url text not null,
       short_code text not null unique,
       created_at timestamp with time zone default timezone('utc'::text, now()) not null,
       clicks integer default 0 not null,
       last_accessed timestamp with time zone
     );

     -- Create function to increment clicks
     create or replace function increment_clicks()
     returns integer
     language sql
     as $$
       select clicks + 1 from urls where id = current_setting('myapp.user_id')::uuid
     $$;
     ```

## Development

Run the bot locally:
```bash
npm run dev
```

## Production Build

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the bot:
   ```bash
   npm start
   ```

## Bot Commands

- `/start` - Display welcome message and available commands
- `/shorten <url>` - Shorten a URL
- `/analytics <short_code>` - Get analytics for a shortened URL

## Deployment on Render

1. Create a new Web Service on Render
2. Connect your repository
3. Set the following:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. Add your environment variables in the Render dashboard
5. Deploy! 