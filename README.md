# 🇮🇳 BharatLens Ultra — Multi-State Language & Culture Identifier

BharatLens Ultra is an AI-powered Progressive Web App (PWA) designed to celebrate and navigate India's linguistic and cultural diversity. By scanning or uploading an image of an everyday object, vegetable, spice, dish, or handicraft, the app instantly identifies it and displays its native name, regional script, phonetic pronunciation, market bargaining phrases, cultural trivia, and Ayurvedic profile across Indian states.

---

## 🌟 Key Features

* **Multimodal Object Identification:** Uses Google's Gemini Vision models to accurately identify objects, produce, dishes, and handicrafts from images.
* **Pan-India Regional Glossary:** Maps items across 12+ Indian states (spanning North, South, East, West, and Central India) with both native script and phonetic English.
* **Natural Indian Female Voice Audio:** Built-in SpeechSynthesis engine calibrated with native Indic voice fallbacks and natural pitch for clear pronunciation.
* **Interactive SVG India Map:** Visually highlights regional zones on hover and allows one-click filtering and card scrolling by selecting any state.
* **🛒 Mandi Bargaining Coach:** Provides everyday market dialogue phrases (e.g., *"How much for 1kg?"*) localized into each state's language and dialect.
* **🌿 Ayurvedic & Wellness Profile:** Displays the item's *Prakriti/Dosha* balance (Vata/Pitta/Kapha), thermal nature (*Taseer*), and seasonal availability.
* **🎯 State Trivia Mini-Game:** Generates multiple-choice language quizzes dynamically from scanned items.
* **🖼️ Flashcard Export:** One-click generation and download of high-resolution summary cards ready for social media or WhatsApp sharing (powered by `html2canvas`).
* **📲 Progressive Web App (PWA):** Fully installable on Android, iOS, and Desktop with offline caching support via Service Workers.
* **🔒 Privacy-Focused Local Storage:** API keys and scan histories remain stored exclusively inside the user's browser `localStorage`.

---

## 🛠️ Tech Stack

* **Frontend:** Vanilla HTML5, CSS3 (Modern Flexbox/Grid, Responsive Mobile-First Design)
* **Logic & APIs:** JavaScript (ES6+), Web MediaDevices API (Camera Capture), Web Speech API (Text-to-Speech)
* **AI Model:** Google Gemini API (`gemini-2.5-flash` / `gemini-3.6-flash`)
* **Libraries:**
  * `html2canvas` (Flashcard graphic generation)
  * `qrcodejs` (In-app installation QR generator)
* **PWA:** Web App Manifest (`manifest.json`), Service Worker (`sw.js`)
* **Hosting:** GitHub Pages

---

## 📁 Project Structure

```text
BharatLens/
├── index.html        # Main app UI, SVG map, camera viewer, and results grid
├── style.css         # Responsive styling, modern cards, and interactive modal design
├── app.js            # Gemini API integration, SpeechSynthesis, and DOM logic
├── manifest.json     # PWA configuration for installability and standalone view
├── sw.js             # Service Worker for offline asset caching
├── icon.png          # App icon for PWA installation
└── README.md         # Documentation
