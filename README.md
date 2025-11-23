# Welcome to Trip Mate - AI-Powered Smart Travel Companion

## Project info

**URL**: https://lovable.dev/projects/7c6bca10-12dc-4180-aba4-3ab297c9b476

## 🌟 Latest Features

### Full Offline PWA Support
Trip Mate now works completely offline! All your trips, maps, weather data, and wellness suggestions are cached locally and sync automatically when you reconnect.

### Google Maps Integration
Professional mapping with Google Maps JavaScript API, including:
- Real-time geocoding
- Interactive markers with info windows
- Auto-fit bounds for all locations
- Offline tile caching

### Weather Smart Planner
Live weather integration that:
- Fetches 14-day forecasts for your destination
- Shows temperature, humidity, rain probability
- Auto-suggests itinerary adjustments for bad weather
- Caches data for offline access

### Wellness AI Assistant
Personalized travel recommendations based on your wellness profile:
- Anxiety and mental wellness support
- Motion sickness prevention
- Claustrophobia-friendly suggestions
- Heart sensitivity accommodations
- Rule-based offline mode

## 🚀 Quick Start

### Prerequisites
- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Google Maps API Key (optional, free tier available)

### Setup Steps

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install dependencies
npm i

# Step 4: Configure environment variables
cp .env.example .env
# Edit .env and add your VITE_GOOGLE_MAPS_API_KEY

# Step 5: Start development server
npm run dev
```

### Google Maps API Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable: Maps JavaScript API, Geocoding API, Places API
4. Create API Key under Credentials
5. Add to `.env` file: `VITE_GOOGLE_MAPS_API_KEY=your_key_here`

**Note:** Google offers $200 free monthly credit. Alternatively, use the free Leaflet/OpenStreetMap integration (already included).

See [README_OFFLINE_SETUP.md](./README_OFFLINE_SETUP.md) for detailed offline mode documentation.

## 📖 How to Edit

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/7c6bca10-12dc-4180-aba4-3ab297c9b476) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/7c6bca10-12dc-4180-aba4-3ab297c9b476) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
