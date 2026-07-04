# 🌱 GeoHarvest

> A satellite-and-weather-powered precision agriculture system that identifies crop type, detects moisture stress, estimates water deficit, and generates irrigation advisories for farm fields.

## 📖 Problem Statement

Farm monitoring is difficult when the land area is large, scattered, or not easily accessible. Farmers and agriculture teams need a way to know:
- What crop is growing.
- Whether the crop is healthy.
- Whether it is under moisture stress.
- How much water it needs.
- Whether irrigation should be applied now.

GeoHarvest converts raw satellite and weather data into actionable agricultural intelligence, presenting the results visually through maps and an intuitive dashboard.

## ✨ Key Features

### 📡 Data & Intelligence
- **Satellite Processing:** Fetches Sentinel-2 imagery and computes NDVI (vegetation health) and NDWI (moisture content).
- **Weather Integration:** Incorporates rainfall, temperature, and evapotranspiration data.
- **Stress Detection:** Analyzes fused data to determine crop health and stress levels (Healthy, Mild, Moderate, High).
- **Irrigation Advisory:** Generates water deficit estimates, urgency levels, and action recommendations.

### 📊 Visualization & Dashboard
- **Interactive Maps:** RGB satellite map, NDVI map, NDWI map, and Stress map.
- **Data Layers:** View rainfall and temperature summaries.
- **Irrigation Panel:** Clear and actionable irrigation advisory panel.
- **Metrics Dashboard:** High-level summary of field conditions.

## 🛠️ Technical Stack

- **Frontend:** React, Leaflet (maps), Recharts / Chart.js, Tailwind CSS
- **Backend:** Node.js, Express
- **AI & Analytics:** Python, Scikit-learn, Random Forest / XGBoost (for future classification), Rule-based logic (MVP)
- **Data Sources:** Google Earth Engine, Sentinel-2, ERA5-Land, CHIRPS
- **Database:** PostgreSQL / MongoDB

## 🏗️ Architecture

```text
React UI 
  → Node.js API 
    → Python analysis service / Earth Engine service 
      → Satellite and weather data sources 
        → Feature extraction 
          → Stress and advisory engine 
            → Response back to UI
```

## 👥 Target Users
- **Primary:** Farmers, Farm managers, Agriculture field officers, Precision agriculture teams.
- **Secondary:** Researchers, Agri-tech reviewers.

## 🚀 Getting Started

*(Instructions for running the project locally will be added here. Typically involves `npm install` and `npm start` in both `Frontend` and `Backend` directories, along with setting up appropriate `.env` keys for Google Earth Engine and Database).*

---
**Vision:** To become a farm intelligence platform that can answer, in simple language: what crop is there, whether it is healthy, how stressed it is, how much water it needs, and what action the farmer should take next.
