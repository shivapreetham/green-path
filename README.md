# 🌿 Green‑Path

An interactive Next.js application that lets users place delivery orders, see eco‑optimized batching and routing on Google Maps, and compare CO₂ savings versus a naïve route.

---

## 🎯 Problem

- Inefficient delivery slot selection → high‑emission trips  
- Customers unaware of their sustainability impact  
- Non‑optimized logistics routes → longer distance & higher emissions  
- No incentives for eco‑friendly choices  

---

## 💡 Solution Overview

1. **Order Placement & Slot Suggestion**  
   - Users pick delivery locations on an embedded Google Map  
   - System recommends the most eco‑friendly time slot  

2. **Batching & Route Visualization**  
   - Groups spatially/temporally close orders into batches  
   - Shows two routes side‑by‑side:  
     - 🌿 **Eco Route:** multi‑color segments optimized for emissions, AQI, and sensitive‑zone avoidance  
     - 🛣️ **Naïve Route:** red dashed shortest‑path baseline  

3. **Metrics & Incentives**  
   - CO₂ savings, AQI exposure reduction, distance/time trade‑offs  
   - Users earn “EcoCoins” and build sustainability streaks  

---

## 🛠 Tech Stack

- **Framework:** Next.js (App Router)  
- **UI:** React, Tailwind CSS, Shadcn/ui, Framer Motion  
- **Maps:** Google Maps JS API via `@react-google-maps/api`  
- **State:** Zustand (lightweight store)  
- **Animations:** requestAnimationFrame for truck, Framer Motion for UI  
- **Icons & Effects:** lucide‑react, canvas‑confetti  

---

## 🚀 Getting Started

1. Clone & install  
   ```bash
   git clone https://github.com/shivapreetham/green-path.git
   cd green-path
   npm install
