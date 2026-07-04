# Product Requirements Document (PRD)

## Project Name
**GeoHarvest**

## One-line Summary
GeoHarvest is a satellite-and-weather-powered precision agriculture system that identifies crop type, detects moisture stress, estimates water deficit, and generates irrigation advisories for farm fields.

---

## 1. Problem Statement
Farm monitoring is difficult when the land area is large, scattered, or not easily accessible. Farmers and agriculture teams need a way to know:
- what crop is growing,
- whether the crop is healthy,
- whether it is under moisture stress,
- how much water it needs,
- and whether irrigation should be applied now.

The solution must work using satellite data, weather data, and AI, and should present the results visually through maps and a dashboard.

---

## 2. Product Goal
Build an end-to-end system that converts raw satellite and weather data into actionable agricultural intelligence.

The product should help users:
- monitor crop health,
- detect water stress early,
- estimate water deficit,
- and support irrigation decisions.

---

## 3. Target Users
### Primary Users
- Farmers
- Farm managers
- Agriculture field officers
- Precision agriculture teams

### Secondary Users
- Researchers
- Hackathon judges
- Agri-tech platform reviewers

---

## 4. Core User Need
The user does not want raw satellite images.
They want clear answers:
- Which crop is present?
- Is the crop healthy?
- Is there moisture stress?
- How much irrigation is needed?
- Which field needs attention first?

---

## 5. Product Scope
### In Scope
- Field selection using polygon or coordinates
- Satellite feature extraction
- Weather feature extraction
- Crop-type estimation logic
- Moisture stress detection logic
- Water deficit estimation
- Irrigation advisory output
- Map-based visualization
- Dashboard with field summaries

### Out of Scope for the MVP
- Fully automated field-level ground truth collection
- Real-time IoT sensor integration
- Production-grade farm management ERP
- Mobile app
- Multi-country policy-specific recommendations
- Perfect crop classification across all crops and seasons

---

## 6. Problem Decomposition
The system is built in layers:

### Layer 1: Data Collection
Collect satellite and weather data for a field.

### Layer 2: Feature Extraction
Convert raw data into useful indicators such as NDVI, NDWI, rainfall, temperature, and evapotranspiration.

### Layer 3: Intelligence Layer
Use rules or AI models to classify crop type, detect stress, and estimate water need.

### Layer 4: Decision Layer
Convert model output into irrigation advice.

### Layer 5: Presentation Layer
Show maps, metrics, and recommendations in the UI.

---

## 7. Functional Overview
The system should perform the following:
1. Accept a field boundary or point location.
2. Pull Sentinel-2 satellite imagery for the area.
3. Calculate NDVI for vegetation health.
4. Calculate NDWI for moisture content.
5. Pull weather data such as rainfall and temperature.
6. Estimate evapotranspiration.
7. Compute water deficit.
8. Classify the field into a stress category.
9. Generate an irrigation recommendation.
10. Display the results on a dashboard and map.

---

## 8. Detailed Workflow
### Step 1: User Input
The user selects a farm field by drawing a polygon or entering coordinates.

### Step 2: Satellite Processing
The system fetches Sentinel-2 imagery and computes:
- NDVI
- NDWI

### Step 3: Weather Processing
The system fetches weather data such as:
- Rainfall
- Temperature
- Evapotranspiration

### Step 4: Feature Fusion
All data points are combined into a single analysis record.

### Step 5: Stress Logic
The system uses either rules or AI to determine:
- Healthy
- Mild stress
- Moderate stress
- High stress

### Step 6: Irrigation Advisory
The system outputs:
- water deficit,
- urgency level,
- and action recommendation.

### Step 7: Visualization
The user sees:
- satellite map,
- vegetation index map,
- moisture index map,
- stress map,
- irrigation advisory panel.

---

## 9. System Context and Conceptual Meaning of Each Data Type
### Sentinel-2
Used to observe crop cover and vegetation condition.

### NDVI
Measures how green and healthy vegetation is.

### NDWI
Measures water or moisture content in vegetation and surface conditions.

### Rainfall
Shows how much water has entered the system naturally.

### Temperature
Shows heat conditions that may increase water loss.

### Evapotranspiration
Represents water leaving the field through evaporation and plant transpiration.

### Water Deficit
Represents the difference between water demand and water supplied.

---

## 10. Recommended Technical Stack
### Frontend
- React
- Leaflet for maps
- Recharts or Chart.js for charts
- Tailwind CSS for styling

### Backend
- Node.js
- Express

### AI / Analytics
- Python
- Scikit-learn
- Random Forest or XGBoost for classification
- Rule-based logic for the MVP

### Remote Sensing / Data Source
- Google Earth Engine
- Sentinel-2
- ERA5-Land
- CHIRPS or equivalent rainfall dataset

### Storage
- PostgreSQL or MongoDB

---

## 11. Architecture Overview
React UI
→ Node.js API
→ Python analysis service or Earth Engine service
→ Satellite and weather data sources
→ Feature extraction
→ Stress and advisory engine
→ Response back to UI

---

## 12. MVP Strategy
For the first version, focus on working modules instead of full research-grade automation.

### MVP should include:
- one field boundary input,
- NDVI and NDWI extraction,
- rainfall and temperature extraction,
- a basic evapotranspiration or water deficit calculation,
- a simple stress scoring rule,
- a clear irrigation recommendation,
- and a clean dashboard.

---

## 13. Success Criteria
The project is successful if it can:
- process a selected field,
- produce meaningful vegetation and moisture metrics,
- estimate a stress level,
- generate an irrigation advisory,
- and visualize the result in a way that is easy to understand.

For the hackathon context, a convincing prototype is more important than perfect scientific accuracy.

---

## 14. Risks and Constraints
### Technical Risks
- Different datasets have different resolutions.
- Weather data may not align perfectly with tiny field polygons.
- Cloud cover may affect optical satellite imagery.
- Seasonal patterns vary by crop and region.

### Product Risks
- Too much scope.
- Building AI too early.
- Trying to solve every crop type and every region at once.

### Mitigation
- Start with one region and a few fields.
- Use rule-based logic first.
- Move to AI only after the data pipeline works.

---

## 15. Phase Plan
### Phase 1
Build data extraction and feature generation.

### Phase 2
Create stress detection and water deficit logic.

### Phase 3
Build crop classification.

### Phase 4
Build dashboard and maps.

### Phase 5
Refine for presentation and demo.

---

# Feature List

## A. Core Features
1. Field boundary input through polygon drawing
2. Sentinel-2 satellite image loading
3. NDVI calculation
4. NDWI calculation
5. Rainfall extraction
6. Temperature extraction
7. Evapotranspiration estimation
8. Water deficit estimation
9. Moisture stress classification
10. Irrigation advisory generation

## B. Visualization Features
1. RGB satellite map
2. NDVI map
3. NDWI map
4. Rainfall layer or summary
5. Temperature layer or summary
6. Stress map
7. Irrigation advisory panel
8. Summary metrics dashboard

## C. Intelligence Features
1. Rule-based stress scoring for MVP
2. Crop type classification using machine learning later
3. Stage-wise moisture interpretation later
4. Confidence or severity output later

## D. System Features
1. API endpoint for field analysis
2. Modular service-based backend structure
3. Data caching or stored outputs
4. Scalable architecture for future expansion

---

## 16. Suggested MVP Deliverables
- One working analysis pipeline for a single field
- Map showing NDVI and NDWI
- Weather-based summary
- Water deficit output
- Stress category
- Irrigation recommendation
- React dashboard to present all of the above

---

## 17. Final Vision
The final product should become a farm intelligence platform that can answer, in simple language:
- what crop is there,
- whether it is healthy,
- how stressed it is,
- how much water it needs,
- and what action the farmer should take next.

