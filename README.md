# SubWatch

A simple subscription tracking web app built with Next.js, Supabase, and Tailwind CSS.

## Features

- Email/password authentication using Supabase
- Add, edit, and delete subscriptions
- Track subscription details:
  - Name
  - Price
  - Billing cycle (monthly/yearly)
  - Renewal date
  - Cancellation URL
- Dashboard showing:
  - Total monthly cost
  - Total yearly cost
  - Next upcoming renewal
- Free users limited to 3 subscriptions
- Email reminders 3 days before renewal

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (Authentication + Database)
- **Icons**: Lucide React

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd subwatch
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API and copy your:
   - Project URL
   - anon public key
   - service_role key
3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Set Up Database Schema

1. Go to the Supabase SQL Editor
2. Run the SQL from `database/schema.sql`

### 4. Configure Authentication

1. In Supabase, go to Authentication > Settings
2. Enable "Email auth" provider
3. Configure your site URL and redirect URLs:
   - Site URL: `http://localhost:3000` (for development)
   - Redirect URLs: `http://localhost:3000/**`

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The app uses a single `subscriptions` table with the following structure:

```sql
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  renewal_date DATE NOT NULL,
  cancel_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Email Reminders

The app includes a Supabase Edge Function (`supabase/functions/send-reminders/index.ts`) that sends email reminders 3 days before subscription renewals.

To set up email reminders:

1. Deploy the Edge Function to Supabase
2. Set up a cron job using `supabase/cron.json`
3. Configure your email service (e.g., Resend, SendGrid) in the function

## Project Structure

```
src/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx          # Main dashboard
│   │   ├── add/page.tsx      # Add subscription form
│   │   └── layout.tsx        # Dashboard layout with nav
│   ├── login/page.tsx        # Login page
│   ├── signup/page.tsx       # Signup page
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page
├── lib/
│   └── supabase.ts           # Supabase client configuration
└── middleware.ts             # Authentication middleware
```

## Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

## License

MIT License
