<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/e5508e6a-c96c-411e-8698-616c147647a1

## Run Locally

**Prerequisites:**
- Node.js
- (Optional) Supabase account for cloud data sync

### Setup Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create or update `.env` file with:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **(Optional) Set up Supabase:**
   - See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions
   - This enables cloud data sync across devices

4. **Run the app:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Features

- 📱 Routine tracking with daily checklist
- 🎯 Personalized supplement recommendations using Gemini AI
- 📊 Calendar view of completion history
- 🔄 Cloud sync with Supabase (optional)
- 💾 Local storage fallback
- ✨ Beautiful UI with Tailwind CSS and animations

## Cloud Data Sync (Optional)

The app supports optional Supabase integration for:
- Syncing data across multiple devices
- Cloud backup of routines and history
- Multi-user support

To enable: Follow the [Supabase setup guide](./SUPABASE_SETUP.md)
