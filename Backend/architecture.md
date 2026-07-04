# AgriSense AI – Complete Technical Documentation

## 1. Project Overview

AgriSense AI is an AI-powered precision agriculture platform that combines:

* Google Earth Engine
* Satellite Remote Sensing
* Weather Data
* AI Analytics
* Google Gemini 2.5 Pro
* React + Node.js

to provide farmers with:

* Crop Health Analysis
* Crop Classification
* Growth Stage Detection
* Disease Risk Assessment
* Irrigation Recommendations
* Fertilizer Recommendations
* Yield Prediction
* Revenue Prediction
* AI-Powered Farm Advisor

The goal is to transform raw satellite imagery into actionable agricultural intelligence.

---

# 2. Overall Architecture

Field Polygon
↓
Google Earth Engine
↓
Satellite Feature Extraction
↓
Analytics Engine
↓
Farm Analysis Object
↓
Gemini 2.5 Pro
↓
Farmer Recommendations
↓
React Dashboard

---

# 3. Technology Stack

## Frontend

* React.js
* Tailwind CSS
* Leaflet / Google Maps

## Backend

* Node.js
* Express.js

## AI

* Gemini 2.5 Pro
* Vertex AI

## Remote Sensing

* Google Earth Engine

## Databases

* MongoDB

## Satellite Sources

### Sentinel-2

Provides:

* NIR Band
* Red Band
* Green Band

Used for:

* NDVI
* NDWI

### CHIRPS

Provides:

* Rainfall

### ERA5

Provides:

* Temperature
* Potential Evapotranspiration

---

# 4. Project Folder Structure

Backend

├── controllers
│
├── routes
│
├── services
│
│ ├── earthEngine
│ │ ├── ndviService.js
│ │ ├── ndwiService.js
│ │ ├── rainfallService.js
│ │ ├── temperatureService.js
│ │ ├── etService.js
│ │ └── areaService.js
│
│ ├── analytics
│ │ ├── cropHealthService.js
│ │ ├── stressService.js
│ │ ├── growthStageService.js
│ │ ├── cropClassificationService.js
│ │ ├── irrigationRecommendationService.js
│ │ ├── irrigationSchedulerService.js
│ │ ├── fertilizerRecommendationService.js
│ │ ├── cropDiseaseRiskService.js
│ │ ├── yieldPredictionService.js
│ │ ├── revenuePredictionService.js
│ │ └── waterDeficitService.js
│
│ ├── ai
│ │ ├── geminiAdvisorService.js
│ │ └── farmAnalysisService.js
│
│ └── reports
│ └── farmReportGeneratorService.js
│
├── utils
│ └── earthEngineAuth.js
│
├── server.js
│
└── .env

---

# 5. Earth Engine Layer

This is the foundation of AgriSense.

Without this layer, no intelligence exists.

Its purpose:

Convert satellite imagery into numerical indicators.

---

## 5.1 NDVI Service

File:

ndviService.js

Purpose:

Measure vegetation health.

Formula:

NDVI = (NIR - RED)/(NIR + RED)

Interpretation:

0.7–0.9 = Healthy Crop

0.4–0.7 = Moderate

<0.3 = Poor Vegetation

Output:

{
"ndvi":0.72
}

---

## 5.2 NDWI Service

File:

ndwiService.js

Purpose:

Measure water content.

Formula:

NDWI = (GREEN - NIR)/(GREEN + NIR)

Interpretation:

Higher value → more moisture

Output:

{
"ndwi":-0.28
}

---

## 5.3 Rainfall Service

Source:

CHIRPS

Purpose:

Determine water availability.

Output:

{
"rainfall":1047
}

---

## 5.4 Temperature Service

Source:

ERA5

Purpose:

Monitor heat stress.

Output:

{
"temperature":24
}

---

## 5.5 ET Service

Purpose:

Estimate water loss.

ET = Evapotranspiration

Used for:

* Irrigation planning
* Water deficit calculations

---

## 5.6 Area Service

Purpose:

Calculate field area.

Output:

{
"areaHectare":1.5
}

Used for:

* Water requirement
* Yield estimation
* Revenue prediction

---

# 6. Time Series Intelligence Layer

This is where the project becomes intelligent.

Instead of one satellite image:

We analyze crop behavior over months.

---

## NDVI Time Series

Output:

Jan → 0.28

Feb → 0.25

Mar → 0.22

...

Purpose:

Understand crop growth.

Used in:

* Growth stage
* Crop classification

---

## NDWI Time Series

Purpose:

Track moisture trends.

Used in:

* Stress analysis
* Irrigation recommendations

---

# 7. Analytics Layer

Converts raw satellite indicators into decisions.

---

## Stress Service

Purpose:

Determine stress level.

Inputs:

* NDVI
* NDWI
* Water Deficit

Output:

LOW

MODERATE

HIGH

---

## Crop Health Service

Purpose:

Generate health score.

Output:

{
"healthScore":92
}

Used in:

* Dashboard
* Yield prediction

---

## Growth Stage Service

Purpose:

Identify crop stage.

Stages:

* Bare Soil
* Seedling
* Vegetative
* Flowering
* Maturity

Output:

{
"growthStage":"Flowering"
}

---

## Crop Classification Service

Purpose:

Identify crop type.

Output:

{
"crop":"Rice"
}

Current:

Rule-Based

Future:

* Random Forest
* XGBoost

---

## Water Deficit Service

Purpose:

Water Deficit = ET − Rainfall

Used for:

* Irrigation planning

---

## Irrigation Recommendation Service

Output:

{
"recommendation":
"Irrigate within 2 days"
}

---

## Irrigation Scheduler Service

Purpose:

Schedule irrigation.

Outputs:

* 24 Hours
* 2 Days
* 5 Days

---

## Fertilizer Recommendation Service

Purpose:

Suggest nutrients.

Examples:

* Nitrogen
* Potassium
* NPK

---

## Crop Disease Risk Service

Purpose:

Predict disease probability.

Output:

{
"risk":"HIGH"
}

Used for:

Early warning system.

---

## Yield Prediction Service

Purpose:

Estimate crop yield.

Output:

{
"yield":"6.2 ton/hectare"
}

Current:

Rule-Based

Future:

Random Forest

XGBoost

LSTM

---

## Revenue Prediction Service

Purpose:

Estimate earnings.

Output:

{
"expectedRevenue":
142600
}

---

# 8. AI Layer

## Farm Analysis Service

Purpose:

Merge all modules.

Creates:

Single Farm Intelligence Object

{
crop,
healthScore,
yield,
revenue,
risk
}

---

## Gemini Advisor Service

Purpose:

Convert technical data into farmer-friendly language.

Input:

Raw farm data.

Output:

Natural language recommendations.

Example:

"Your rice crop is healthy. Disease risk is moderate due to high rainfall. Irrigation is recommended within 48 hours."

---

# 9. Report Generation Layer

Purpose:

Generate final report.

Includes:

* Crop
* Health
* Yield
* Revenue
* Disease Risk
* Recommendations

Formats:

* JSON
* PDF

---

# 10. Future Work (Remaining Roadmap)

## Phase 2

### Advanced Crop Classification

Current:

Rule-Based

Future:

* Random Forest
* XGBoost

Using:

* NDVI Time Series
* NDWI Time Series
* Weather Data

---

### Phenology Engine

Detect:

* Sowing
* Vegetative
* Flowering
* Grain Filling
* Harvest

---

### Advanced Disease Detection

Use:

* Sentinel-2
* Gemini Vision

Predict:

* Rust
* Blight
* Fungal Infections

---

### Drought Prediction

Predict future stress.

---

### Yield Prediction ML

Current:

Rule-Based

Future:

LSTM

Random Forest

Gradient Boosting

---

### Fertilizer Optimization

Estimate exact fertilizer quantity.

---

### Water Requirement Calculator

Calculate:

Water Needed (Liters)

Based on:

* Area
* ET
* Rainfall

---

### AI Chat Assistant

Ask:

"Why is NDVI dropping?"

Gemini answers using real farm data.

---

### Voice Assistant

Languages:

* Hindi
* English
* Regional Languages

Using:

* Gemini
* Text-to-Speech

---

### WhatsApp Integration

Farmer receives:

* Disease Alerts
* Irrigation Alerts
* Yield Forecasts

---

### PDF Report Generator

Generate downloadable farm report.

---

### React Dashboard

Features:

* Satellite Maps
* NDVI Maps
* NDWI Maps
* Charts
* AI Recommendations

---

# 11. Final Vision

AgriSense AI is not just a crop monitoring system.

It is an AI-powered digital agronomist that combines:

* Satellite Intelligence
* Weather Intelligence
* Machine Learning
* Gemini AI

to provide farmers with real-time, actionable, and personalized agricultural decisions.

Final Flow:

Farm Polygon
↓
Earth Engine
↓
Feature Extraction
↓
Analytics Engine
↓
Farm Analysis
↓
Gemini 2.5 Pro
↓
AI Recommendations
↓
Dashboard / Mobile App / WhatsApp
↓
Farmer Action
