# TouristHub - Top Tourist Attractions in UAE 🇦🇪

**TouristHub** is a premier, responsive web application showcasing iconic tourist attractions across the United Arab Emirates (Dubai, Abu Dhabi, Ras Al Khaimah, Sharjah).

*Created By Raza*

## ✨ Key Features

- **📱 Fully Responsive Card Grid**: Optimized for mobile, tablet, and desktop viewports (3 columns desktop, 2 tablet, 1 mobile).
- **🗺️ Interactive Map & View in Map Action**:
  - **Option A**: Direct external link opening Google Maps targeted location in a new tab.
  - **Option B**: Interactive Leaflet.js overlay modal zoomed into exact coordinates `[lat, lng]` with custom map pin markers.
  - **Full Map View**: Toggle to switch between grid cards and full map layout with all markers.
- **💬 AI Trip Assistant ("Ask Travel AI")**: Interactive chatbot widget providing instant custom itinerary recommendations (e.g., "3 hours in the afternoon", "free entry places", "nighttime spots").
- **🎟️ Entry Fee Display**: Shows ticket prices and free entry tags on every card and detail modal.
- **⭐ Community Reviews & Ratings**: Users can leave star ratings and comments stored locally in `localStorage`.
- **☀️ Day vs. 🌙 Night Activity Toggles**: Filter places by daytime outdoor spots or nightlife illuminated monuments.
- **🔥 Must Go Highlights**: Quick filter to highlight premier unmissable global landmarks.
- **🔍 Real-time Search & Filters**: Live search input, category pills, and Emirate filters.
- **❤️ Favorites System**: Bookmark favorite places saved in browser storage.

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3 (Vanilla CSS System), JavaScript (ES6 Modules & Async/Await).
- **Mapping Engine**: Leaflet.js & CartoDB tiles.
- **Icons & Fonts**: Remixicon, Google Fonts (Outfit & Plus Jakarta Sans).
- **Data Source**: Modular JSON structure (`data/attractions.json`).

## 🚀 How to Run Locally

1. Clone repository:
   ```bash
   git clone https://github.com/kandararazz/touristHub.git
   cd touristHub
   ```
2. Run a simple local HTTP server:
   ```bash
   python3 -m http.server 8080
   ```
3. Open browser at `http://localhost:8080`.
