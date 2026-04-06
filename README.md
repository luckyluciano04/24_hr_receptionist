# 24hr Receptionist

AI-powered receptionist service for small businesses. Answers every call, captures every lead, and delivers the info straight to you — 24/7, no staff required.

**Live site:** [24hrreceptionist.com](https://24hrreceptionist.com)

---

## System Overview

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| Backend | Next.js API routes (serverless) |
| Database | Supabase (Postgres + Auth) |
| Payments | Stripe Checkout + Webhooks + Billing Portal |
| Voice/AI | Twilio voice recording + OpenAI transcription/summaries |
| Email | Resend |
| CRM | Google Sheets API v4 |
| Automation | Google Apps Script |
| Hosting | Vercel |

### Pricing Tiers

| Plan | Price | Calls/mo | Notifications |
|------|-------|----------|---------------|
| Starter | $97/mo | 100 | Email |
| Professional | $197/mo | 500 | SMS + Email |
| Enterprise | $397/mo | Unlimited | Slack + SMS + Email + CRM |

---

## Prerequisites

- Node.js 18+
- npm 9+
- A [Supabase](https://supabase.com) account (free tier works)
- A [Stripe](https://stripe.com) account
- A [Twilio](https://twilio.com) account with a phone number
- An [OpenAI](https://platform.openai.com) API key
- A [Resend](https://resend.com) account
- A Google Cloud project with Sheets API enabled + Service Account
- (Optional) [Tally](https://tally.so) account for intake forms

---

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/luckyluciano04/24_hr_receptionist.git
cd 24_hr_receptionist
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in every value (see sections below for how to get each one).

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
3. Go to **SQL Editor** and run the contents of `supabase/migrations/001_initial_schema.sql`
4. Enable **Email auth** under Authentication → Providers

### 4. Set up Stripe

1. Create products + prices in your [Stripe Dashboard](https://dashboard.stripe.com):
   - Starter: $97/month recurring
   - Professional: $197/month recurring
   - Enterprise: $397/month recurring
2. Copy the price IDs to your env file:
   - `STRIPE_PRICE_STARTER=price_...`
   - `STRIPE_PRICE_PROFESSIONAL=price_...`
   - `STRIPE_PRICE_ENTERPRISE=price_...`
3. Copy your secret key to `STRIPE_SECRET_KEY`
4. Copy your publishable key to `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### 5. Run locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Stripe Webhook Setup

### Local development (using ngrok)

```bash
# Terminal 1: Start Next.js
npm run dev

# Terminal 2: Expose local server
npx ngrok http 3000
```

1. Copy the ngrok HTTPS URL (e.g., `https://abc123.ngrok.io`)
2. Go to Stripe Dashboard → Developers → Webhooks → Add endpoint
3. URL: `https://abc123.ngrok.io/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy the webhook signing secret → `STRIPE_WEBHOOK_SECRET`

### Production (Vercel)

1. After deploying to Vercel, use your production URL:
   `https://your-domain.vercel.app/api/stripe/webhook`
2. Add the same events as above
3. Update `STRIPE_WEBHOOK_SECRET` in Vercel environment variables

---

## Tally Webhook Configuration

1. Create an intake form at [tally.so](https://tally.so)
2. Include fields: Business Name, Contact Name, Phone, Email, Call Volume, Industry
3. Copy the form ID to `NEXT_PUBLIC_TALLY_FORM_ID`
4. In Tally: Form Settings → Integrations → Webhooks
5. Add webhook URL: `https://your-domain.vercel.app/api/tally/webhook`
6. Set method: POST

---

## Google Sheets Setup

### Create a Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Enable the **Google Sheets API**
4. Go to **IAM & Admin → Service Accounts → Create Service Account**
5. Download the JSON key file
6. Encode the JSON as a single line and paste into `GOOGLE_SERVICE_ACCOUNT_JSON`

```bash
# Convert JSON to single-line string
cat service-account.json | tr -d '\n' | sed 's/"/\\"/g'
```

### Share your sheet with the service account

1. Open your Google Sheet
2. Share it with the service account email (found in the JSON file)
3. Give **Editor** permissions
4. Copy the Sheet ID from the URL: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`
5. Save the Sheet ID in your user's profile record (`google_sheet_id` column in Supabase)

---

## Twilio Setup

1. Sign up at [twilio.com](https://twilio.com)
2. Get your Account SID and Auth Token from the Console Dashboard
3. Buy a phone number (or use the trial number)
4. Copy values to your env file:
   - `TWILIO_ACCOUNT_SID=AC...`
   - `TWILIO_AUTH_TOKEN=...`
   - `TWILIO_PHONE_NUMBER=+1...`

### Configure Voice Webhook

In Twilio Console → Phone Numbers → Your Number:
- Voice webhook URL: `https://your-domain.vercel.app/api/twilio/voice`
- Method: `HTTP POST`
- Status callback URL: `https://your-domain.vercel.app/api/twilio/status`
- Callers will hear a greeting and leave a message that is transcribed, summarized, and delivered automatically.

---

## Google Apps Script Deployment

1. Open any Google Sheet you want to use for lead tracking
2. Go to **Extensions → Apps Script**
3. Delete the default code and paste the entire contents of `scripts/apps-script/receptionist-automation.gs`
4. Update the `CONFIG` object at the top:
   - Set `NOTIFICATION_EMAIL` to your email address
   - Optionally set `WEBHOOK_URL` to receive POST notifications
5. Click **Save** (give the project a name)
6. Run `setupTrigger()` once:
   - Select `setupTrigger` from the function dropdown
   - Click **Run**
   - Grant permissions when prompted
7. Test by running `testRun()` — check your email and the Logger for results

---

## Deployment to Vercel

### Deleting an existing Vercel project

If you need to remove an old or misconfigured Vercel project (e.g. `24-hr-receptionist-yocx`):

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select the project you want to delete
3. Click **Settings** (top navigation tab)
4. Scroll to the bottom of the Settings page to the **Danger Zone** section
5. Click **Delete Project** and confirm

### Creating a fresh Vercel project

```bash
npm install -g vercel
vercel
```

Follow the prompts to link to your GitHub repository and choose a project name.

### Required Environment Variables

The build will **fail** if any of the following variables are missing. They must all be set before the first successful deployment.

| Variable | Description | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | Supabase Dashboard → Settings → API → `anon public` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (secret) | Supabase Dashboard → Settings → API → `service_role` |
| `STRIPE_SECRET_KEY` | Stripe secret API key | Stripe Dashboard → Developers → API keys → Secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Stripe Dashboard → Developers → Webhooks → your endpoint → Signing secret |
| `STRIPE_PRICE_STARTER` | Stripe price ID for Starter plan ($97/mo) | Stripe Dashboard → Products → Starter → Price ID (`price_...`) |
| `STRIPE_PRICE_PROFESSIONAL` | Stripe price ID for Professional plan ($197/mo) | Stripe Dashboard → Products → Professional → Price ID |
| `STRIPE_PRICE_ENTERPRISE` | Stripe price ID for Enterprise plan ($397/mo) | Stripe Dashboard → Products → Enterprise → Price ID |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID | Twilio Console → Dashboard (`AC...`) |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | Twilio Console → Dashboard |
| `TWILIO_PHONE_NUMBER` | Twilio phone number in E.164 format | Twilio Console → Phone Numbers (e.g. `+12025550100`) |
| `OPENAI_API_KEY` | OpenAI API key | platform.openai.com → API keys (`sk-...`) |
| `RESEND_API_KEY` | Resend API key | resend.com → API Keys (`re_...`) |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Google Service Account credentials as a single-line JSON string | Google Cloud Console → IAM & Admin → Service Accounts → Keys → JSON (see note below) |
| `NEXT_PUBLIC_APP_URL` | Your production URL (must be a valid absolute URL) | Your custom domain or Vercel URL, e.g. `https://24hrreceptionist.com` |

> **Note on `GOOGLE_SERVICE_ACCOUNT_JSON`:** Download the JSON key file from Google Cloud, then convert it to a single-line string:
> ```bash
> cat service-account.json | python3 -c "import json,sys; print(json.dumps(json.load(sys.stdin)))"
> ```
> Paste the entire output as the value of this variable.

### Optional Environment Variables

These are not required to build but enable additional features:

| Variable | Description | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (for frontend Stripe.js) | Stripe Dashboard → Developers → API keys → Publishable key |
| `NEXT_PUBLIC_TALLY_FORM_ID` | Tally form ID for intake forms | tally.so → your form URL (e.g. `mVZXk7`) |

### Setting Environment Variables in the Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Click the **Settings** tab
4. Click **Environment Variables** in the left sidebar
5. For each variable in the table above:
   - Enter the **Name** (e.g. `STRIPE_SECRET_KEY`)
   - Enter the **Value**
   - Select environments: **Production**, **Preview**, and **Development** as appropriate
   - Click **Save**
6. After all variables are added, go to the **Deployments** tab and click **Redeploy** on the latest deployment

### Setting Environment Variables via CLI

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_WEBHOOK_SECRET
vercel env add STRIPE_PRICE_STARTER
vercel env add STRIPE_PRICE_PROFESSIONAL
vercel env add STRIPE_PRICE_ENTERPRISE
vercel env add TWILIO_ACCOUNT_SID
vercel env add TWILIO_AUTH_TOKEN
vercel env add TWILIO_PHONE_NUMBER
vercel env add OPENAI_API_KEY
vercel env add RESEND_API_KEY
vercel env add GOOGLE_SERVICE_ACCOUNT_JSON
vercel env add NEXT_PUBLIC_APP_URL
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
vercel env add NEXT_PUBLIC_TALLY_FORM_ID
```

### Redeploy after adding env vars

```bash
vercel --prod
```

---

## Going Live Checklist

- [ ] All environment variables set in Vercel
- [ ] Supabase migration executed
- [ ] Stripe products + prices created
- [ ] Stripe webhook configured with production URL
- [ ] Twilio voice webhook configured with production URL
- [ ] Google Service Account created and sheet shared
- [ ] Apps Script deployed with setupTrigger() run
- [ ] Resend domain verified (or using sandbox)
- [ ] Test Stripe checkout with card `4242 4242 4242 4242`
- [ ] Test call forwarding to your Twilio number
- [ ] Verify email notifications are received
- [ ] Verify SMS notifications are received (Professional+ plans)
- [ ] Check dashboard loads and shows call log
- [ ] Confirm Stripe billing portal works
- [ ] Run Lighthouse audit (target: Performance >90, Accessibility >95)

---

## Support

For support questions, email: **support@24hrreceptionist.com**

For bug reports, open an issue on GitHub.

---

## License

Private — All rights reserved. © 2024 24hrreceptionist.com
