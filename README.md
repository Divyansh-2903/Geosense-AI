# GeoHarvest AI

GeoHarvest AI is a precision agriculture platform that turns raw satellite imagery and weather data into practical advice for farmers. You draw a field boundary on a map, and the system pulls satellite data, calculates vegetation and moisture indices, figures out how stressed the crop is, estimates how much water the field needs, and gives you a clear irrigation recommendation. It then explains everything in plain language using Google Gemini.

It was built as a hackathon prototype for the ISRO Bharatiya Antariksh Hackathon, where the goal was to combine optical and microwave satellite data with AI to solve real problems in agriculture.

---

## The Problem It Solves

Farm monitoring is hard when fields are large, scattered, or difficult to reach. Farmers and agriculture teams constantly need answers to a few simple questions:

- What crop is growing in this field?
- Is the crop healthy right now?
- Is it under moisture stress?
- How much water does it actually need?
- Should I irrigate today, or can it wait?

Raw satellite images do not answer any of these questions on their own. GeoHarvest bridges that gap by processing the imagery, fusing it with weather data, running it through an analytics engine, and presenting the results as clear, actionable advice on a dashboard.

---

## How It Works

The system is built as a pipeline with several connected layers.

1. **Field input.** You select a farm field by drawing a polygon on the map or entering coordinates.
2. **Satellite processing.** The backend connects to Google Earth Engine and pulls Sentinel-2 optical imagery and Sentinel-1 radar data for that area. It then computes a range of vegetation and moisture indices.
3. **Weather processing.** It pulls rainfall from CHIRPS and temperature, evapotranspiration, humidity, wind speed, solar radiation, and evaporation from ERA5.
4. **Feature fusion.** All of these data points are combined into a single analysis record for the field.
5. **Intelligence layer.** Rule-based and mock machine-learning models classify the crop, detect the growth stage, score crop health, assess disease risk, and estimate yield and revenue.
6. **Decision layer.** The system converts the analysis into a water deficit figure, a stress category, an irrigation schedule, a fertilizer plan, and an urgency score.
7. **AI advisor.** The full analysis is sent to Google Gemini, which writes a natural-language advisory report and powers a chat assistant that can answer follow-up questions about the field.
8. **Presentation.** Everything comes back to a React dashboard with maps, charts, health cards, and downloadable PDF reports.

If Earth Engine is unavailable or times out, the system falls back to a dynamic agronomical model that generates realistic estimates based on the crop type and field inputs, so the dashboard always returns a meaningful result.

---

## Features

### Satellite and Remote Sensing

- Sentinel-2 optical imagery for RGB visualization and vegetation indices
- Sentinel-1 SAR radar metrics (VV, VH, and VH/VV ratio) for structure and moisture
- NDVI for vegetation health
- NDWI for surface and canopy moisture
- EVI for dense vegetation monitoring
- SAVI for sparse vegetation and exposed soil
- SMI for soil moisture
- VCI for drought detection
- Monthly NDVI and NDWI time series to track crop behavior across the year

### Weather and Water

- Rainfall, temperature, and evapotranspiration from CHIRPS and ERA5
- Humidity, wind speed, solar radiation, and evaporation
- Water deficit calculation (evapotranspiration minus rainfall)
- Irrigation recommendation and scheduler
- Water requirement in litres based on field area and deficit

### Analytics and Intelligence

- Rule-based crop classification with a mock machine-learning model foundation (designed for Random Forest and XGBoost later)
- Growth stage detection (bare soil, seedling, vegetative, flowering, maturity)
- Crop health scoring from 0 to 100
- Stress classification (low, moderate, high)
- Disease risk assessment with likely disease identification
- Fertilizer recommendation with quantity plans
- Yield prediction in tons per hectare
- Revenue prediction based on market prices
- Agronomy recommendations including crop calendar and disease advisory

### AI Assistant

- Gemini 2.5 Pro generates a full advisory report in plain language from the farm data
- A chat assistant lets you ask follow-up questions like "why is my NDVI dropping?" and get answers grounded in your actual field report
- Works with either the Google AI Studio API or Vertex AI

### Dashboard and Visualization

- Interactive map with switchable layers (RGB satellite, NDVI, NDWI, stress)
- Crop health cards showing NDVI, vigor, moisture, and stress
- Charts for vegetation and moisture trends over time
- Downloadable PDF farm reports
- Farm history that stores up to 50 past analyses per field
- 3D field scene built with Three.js and React Three Fiber
- Multi-language support for 25 Indian languages via Google Translate

### Accounts and Farm Management

- JWT-based authentication with register, login, and profile management
- Each user has a farm profile (land size, crops, soil type, irrigation type)
- Create, view, and delete farm fields
- Save analysis reports to farms and review history over time
- SMS and WhatsApp alert placeholders that trigger when stress reaches critical or high levels

---

## Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, Recharts, Three.js, React Three Fiber, jsPDF, Lucide icons, Motion

**Backend:** Node.js, Express, JSON Web Tokens, bcrypt, Mongoose

**Database:** MongoDB

**AI:** Google Gemini 2.5 Pro via the Google Gen AI SDK (works with AI Studio API or Vertex AI)

**Remote sensing:** Google Earth Engine, Sentinel-2, Sentinel-1, CHIRPS, ERA5

**Deployment:** Render

---

## Project Structure

```
GeoHarvest-AI/
├── Backend/
│   ├── config/              Environment and config loading
│   ├── controllers/         Request handlers (analysis, auth, chat, farm, map layers)
│   ├── middleware/          JWT auth protection
│   ├── models/              Mongoose models (User, Farm)
│   ├── routes/              Express route definitions
│   ├── services/
│   │   ├── earthEngine/     Earth Engine index and weather services
│   │   ├── analytics/       Crop health, growth stage, disease, yield, revenue
│   │   ├── agronomy/        Crop calendar, water requirement, fertilizer, disease advisory
│   │   ├── reports/         PDF and JSON farm report generation
│   │   └── ...              Stress, water deficit, irrigation, Gemini advisor, notifications
│   ├── utils/               Earth Engine authentication
│   └── server.js            Express app entry point
├── Frontend/
│   ├── src/
│   │   ├── components/      UI components (Hero, Features, Dashboard, Auth, 3D scene)
│   │   ├── config/          API base URL configuration
│   │   ├── context/         Auth and language React contexts
│   │   └── App.tsx          Root component
│   └── vite.config.ts       Vite build and dev server config
├── render.yaml              Render deployment configuration
└── package.json             Root scripts for install, build, and start
```

---

## Prerequisites

Before you start, you will need the following:

- Node.js (version 18 or newer)
- A MongoDB database (a free Atlas cluster works fine)
- A Google Cloud project with the Earth Engine API enabled
- A Google Earth Engine service account key (JSON)
- A Google Gemini API key from Google AI Studio, or a Vertex AI setup

---

## Setup and Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd GeoHarvest-AI
```

2. Install dependencies for both the frontend and backend from the root:

```bash
npm run install-all
```

This runs `npm install` inside both the `Backend` and `Frontend` directories.

---

## Environment Variables

Create a `.env` file in the `Backend` directory with the following keys:

```env
# Database
MONGO_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_secret_string

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-pro

# Google Earth Engine
GOOGLE_SERVICE_ACCOUNT_JSON=your_earth_engine_service_account_json

# Optional: use Vertex AI instead of the AI Studio API
USE_VERTEX_AI=false
GCP_PROJECT=your_gcp_project_id
GCP_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=path_to_credentials.json
```

For the frontend, you can optionally set the API base URL in a `.env.local` file inside the `Frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

If you leave this unset, the frontend automatically uses `http://localhost:5001/api` in development and `/api` in production.

---

## Running Locally

You need to run both the backend and the frontend.

Start the backend (runs on port 5001):

```bash
cd Backend
npm start
```

Start the frontend (runs on port 3000):

```bash
cd Frontend
npm run dev
```

Open `http://localhost:3000` in your browser. The frontend will talk to the backend at `http://localhost:5001/api`.

---

## Building for Production

From the root directory, you can build the frontend and start the backend together:

```bash
npm run build
npm start
```

The `build` script compiles the React frontend with Vite, and the `start` script launches the Node.js backend.

---

## API Reference

### Authentication

| Method | Endpoint              | Description                          |
|--------|-----------------------|--------------------------------------|
| POST   | /api/auth/register    | Create a new account                 |
| POST   | /api/auth/login       | Log in and receive a JWT             |
| GET    | /api/auth/me          | Get the current user profile         |
| PUT    | /api/auth/profile     | Update profile and farm details      |
| PUT    | /api/auth/password    | Change password                      |

### Farms

| Method | Endpoint                  | Description                                  |
|--------|---------------------------|----------------------------------------------|
| POST   | /api/farms                | Create a new farm field                      |
| GET    | /api/farms                | List all farms for the logged-in user        |
| GET    | /api/farms/:id            | Get a single farm with its analysis history  |
| GET    | /api/farms/:id/history    | Get saved analysis history for a farm        |
| DELETE | /api/farms/:id            | Delete a farm                                |
| POST   | /api/farms/:id/analysis   | Save an analysis report to a farm            |

### Analysis and AI

| Method | Endpoint           | Description                                                        |
|--------|--------------------|--------------------------------------------------------------------|
| POST   | /api/analysis      | Run the full field analysis pipeline and return a farm report      |
| POST   | /api/chat          | Ask the Gemini chat assistant a question about a field report     |
| POST   | /api/map-layer     | Generate an Earth Engine map tile layer for visualization         |

All farm routes are protected and require a `Bearer` token in the `Authorization` header.

---

## Deployment on Render

The project includes a `render.yaml` file configured for Render. To deploy:

1. Push the repository to GitHub.
2. Create a new Blueprint deployment on Render and connect the repository.
3. Render will read the `render.yaml` file and create the web service automatically.
4. Set the following environment variables in the Render dashboard:
   - `MONGO_URI`
   - `JWT_SECRET` (can be auto-generated)
   - `GEMINI_API_KEY`
   - `GOOGLE_SERVICE_ACCOUNT_JSON`

The build command runs `npm run install-all && npm run build`, and the start command runs `npm start`, which launches the backend and serves the built frontend.

---

## Roadmap

The current prototype is roughly 70 to 75 percent complete. The biggest remaining improvements are:

- Replacing the mock machine-learning models with real Random Forest and XGBoost crop classification trained on NDVI and NDWI time series
- LSTM-based yield prediction
- A satellite time slider to scroll through months of imagery
- Before and after satellite comparison views
- A district-level water stress heatmap
- WhatsApp and SMS alert integration with real providers
- A voice assistant in Hindi and regional languages
- A mobile app with offline mode

---

## The Vision

GeoHarvest AI is meant to become a farm intelligence platform that can answer, in simple language, what crop is growing, whether it is healthy, how stressed it is, how much water it needs, and what action the farmer should take next. The hackathon prototype proves the end to end pipeline works, from a drawn polygon all the way to an AI-written irrigation advisory.
