# 🌿 Green‑Path

**Green‑Path** is a Next.js client application that lets users place delivery orders and visualize eco‑optimized batching & routing on Google Maps. By comparing a “naïve” route vs. an “eco” route, it highlights CO₂ savings and smarter delivery planning.

<p align="center">
  <!-- Replace with your own demo GIF or screenshot -->
  <img src="docs/demo.gif" alt="Green‑Path Demo" width="800" />
</p>

---

## 🚀 Features

- **Order Placement**  
  Interactive map-based address picker for users to select delivery locations.

- **Batching Logic**  
  Group multiple orders into delivery batches behind the scenes to minimize trips.

- **Dual‑Route Visualization**  
  - 🌿 **Eco Route:** Multi‑color polylines showing energy‑efficient path segments.  
  - 🛣️ **Naïve Route:** Red dashed line for standard shortest‑path routing.

- **Truck Animation**  
  Real‑time moving truck marker animates along the chosen route.

- **Info Windows & Labels**  
  Click on markers to view order details; orders are labeled A, B, C… for clarity.

- **Legend & Controls**  
  Toggle between “Eco” and “Naïve” views; map auto‑fits bounds on load.

---

## 🛠 Tech Stack

- **Framework:** Next.js (App Router)  
- **Language:** TypeScript & React  
- **Styling:** Tailwind CSS & Framer Motion  
- **Maps:** Google Maps JavaScript API via `@react-google-maps/api`  
- **Animation:** requestAnimationFrame (truck), Framer Motion (UI)  
- **Icons & UI:** lucide‑react, canvas‑confetti  

---

## ⚙️ Quick Start

1. **Clone the repo**  
   ```bash
   git clone https://github.com/shivapreetham/green-path.git
   cd green-path
