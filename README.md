# 📱 WebAR Mobile Teardown & Interactive 3D Inspection System

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r128-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![MediaPipe](https://img.shields.io/badge/Google%20MediaPipe-Hands%20AI-00897B?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/mediapipe)
[![Devices Supported](https://img.shields.io/badge/Database-1%2C730%2B%20Smartphones-FF6F00?style=for-the-badge&logo=android&logoColor=white)](src/data/phones.json)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

> **An enterprise-grade, zero-download procedural 3D Augmented Reality teardown workstation that reconstructs, explodes, and inspects over 1,730+ real smartphones in real-time with authentic component architectures, dynamic hardware matching, and AI touchless air gesture controls.**

---

## 🌟 Highlights & Key Innovations

* **🚀 1,730+ Authentic Real Smartphone Database**: Instant procedural 3D generation across Apple, Samsung, Google Pixel, Xiaomi, OnePlus, Infinix, Realme, Vivo, Motorola, Nothing, and more.
* **⚡ 100% Zero-Download Procedural 3D Architecture**: Eliminates tens of gigabytes of heavy 3D GLB/GLTF assets. Every chassis, backpanel, camera lens, optical sensor, battery cell, and flex cable is procedurally synthesized via Three.js parametric geometries and procedural canvas shaders at 60 FPS.
* **🔬 Dynamic Spec-Accurate Component Resolver**: Hardware components dynamically match each phone's real technical specifications:
  * **Displays**: *Super Retina XDR OLED* vs *Dynamic AMOLED 2X* vs *FHD+ 90Hz IPS LCD*.
  * **Cooling Systems**: *Bionic Liquid Vapor Chamber* vs *Multi-Layer Flexible Graphite Thermal Sheet*.
  * **Biometrics & Cameras**: *TrueDepth 3D Face ID Dot Projector* vs *Punch-Hole Optical Selfie Sensor*.
  * **Chassis & Backpanels**: *Gorilla Glass Victus* vs *Aviation-Grade Polycarbonate* with laser pinstripes, holographic chevron wave flows, and circular/squircle camera visors.
  * **Inductive Charging**: *MagSafe Ferrite Wireless Ring* vs *Standard Qi Coil* vs *Mid-Frame Stiffener & NFC Shield*.
* **🖐️ AI Air Gesture Control (Google MediaPipe Hands)**: Real-time web-cam neural hand tracking allowing touchless interaction:
  * 🤏 **Index Pinch**: Smooth continuous explosion / layer separation slider.
  * ✌️ **Two-Finger V-Sign / Fist**: Instant smart reassemble & snap-to-chassis.
  * ✋ **Open Palm Movement**: Fluid 3D orbital inspection and 360° rotational pivot.
* **🔊 Procedural Audio & Haptic Feedback Engine**: Native Web Audio API synthesizer generating tactile spatial clicks, explosion hums, and reassembly snaps without external audio files.

---

## 📸 Interactive System Interface

```
┌────────────────────────────────────────────────────────────────────────┐
│  [● Device Tag: Infinix Hot 11S]          [🎥 AR Camera Background]    │
│                                                                        │
│                               ┌───────┐                                │
│                               │ 📷 📸 │ 50MP Dual Circle Owl Camera    │
│                               │   ○   │ Holographic Wave Chevron       │
│                               └───────┘ Rear Squircle Fingerprint      │
│                                                                        │
│   Layer 1: Back Cover [Polycarbonate Gloss Wave-Flow]                 │
│   Layer 2: Internal Mid-Frame Stiffener & NFC Antenna                 │
│   Layer 3: 5000 mAh Li-Po Battery Pack                                │
│   Layer 4: Helio G88 Motherboard & Sub-Board FPC                      │
│   Layer 5: Multi-Layer Flexible Graphite Thermal Sheet                │
│   Layer 6: 6.78" FHD+ 90Hz IPS LCD Display Panel                      │
│                                                                        │
│  [◀ Step 1 of 13 ▶]  [ ───●────────── 85% Explode ]  [✨ Reassemble]   │
│  [ 📱 IPS LCD ] [ 📷 8MP Selfie ] [ ⚡ Battery ] [ ❄️ Graphite Sheet ]  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18 (Vite 5)** | High-performance single page application with instant HMR and pure JavaScript (`.jsx`). |
| **3D Rendering Engine** | **Three.js (r128)** | Parametric geometry synthesis, PBR materials, procedural canvas textures, and custom shaders. |
| **Computer Vision AI** | **MediaPipe Hands** | Multi-landmark hand estimation for air gesture controls through live user webcam streams. |
| **Styling & UI** | **Tailwind CSS + Lucide Icons** | Cyberpunk glassmorphism HUD interface, responsive across desktops, tablets, and phones. |
| **State Management** | **React Hooks & Custom Stores** | Reactive inspection state, step-by-step layer control, and dynamic component resolution. |
| **Sound Synthesis** | **Web Audio API** | Real-time procedural audio synthesis for clicks, slider drags, and mechanical snaps. |

---

## 📂 Project Directory Structure

```text
augmented-reality-mobile/
├── public/                     # Static assets and icons
├── src/
│   ├── assets/                 # Brand SVG marks and illustrations
│   ├── components/
│   │   ├── ar/
│   │   │   ├── AirGestureOverlay.jsx   # MediaPipe gesture detection HUD
│   │   │   ├── LayerStepControls.jsx   # 13-step teardown step navigation
│   │   │   ├── PartDetailCard.jsx      # Spec sheet, failure points & tools card
│   │   │   └── TeardownControls.jsx    # Explode slider, audio toggle & component dock
│   │   ├── common/
│   │   │   ├── AudioEffects.js         # Procedural Web Audio API sound generator
│   │   │   └── Navigation.jsx          # Glassmorphic top navigation bar
│   │   └── phone-selection/            # 1,730+ phone search and filter matrix
│   ├── data/
│   │   ├── componentResolver.js        # Dynamic specification resolver (LCD/OLED/Graphite)
│   │   └── phones.json                 # 1,730+ verified smartphone technical specifications
│   ├── pages/
│   │   ├── ARAppPage.jsx               # Main WebAR inspection and teardown workstation
│   │   ├── HomePage.jsx                # Interactive landing page and feature overview
│   │   └── PhoneCatalogPage.jsx        # Searchable 1,730+ device directory
│   ├── three/
│   │   ├── phoneBuilder.js             # Parametric procedural 3D smartphone generator
│   │   ├── PhoneViewer.jsx             # Three.js canvas container, raycaster & orbit controls
│   │   └── textureGenerators.js        # Procedural canvas textures (wave-flow, pinstripes, carbon)
│   ├── App.jsx                         # Main application root & routing
│   ├── index.css                       # Global Tailwind styling & custom scrollbars
│   └── main.jsx                        # React 18 DOM mount point
├── index.html                          # Entry HTML with WebXR and camera permissions
├── package.json                        # Project dependencies and build scripts
├── vite.config.js                      # Optimized Vite build configuration
└── README.md                           # Documentation and showcase
```

---

## ⚡ Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* Modern web browser with WebGL 2.0 support (Chrome, Firefox, Edge, Safari)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Denesh-developer/augmented-reality-mobile.git
   cd augmented-reality-mobile
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to `http://localhost:5173` to launch the interactive application.

---

## 🎮 How to Use & Controls

| Input Action | Mode | Description |
| :--- | :--- | :--- |
| **Left Click + Drag** | Orbit Control | 360° free rotational inspection around the 3D phone model. |
| **Right Click + Drag** | Pan Control | Translate viewport across X and Y screen planes. |
| **Mouse Wheel** | Zoom | Smooth camera zoom in/out of fine hardware micro-components. |
| **Single Tap / Click** | Part Selection | Selects any individual hardware layer (Battery, Motherboard, etc.) with glowing outline and detail card. |
| **Slider Drag** | Explode Layer | Continuously separates layers outward along the Z-axis (0% to 100%). |
| **Pinch Gesture (🤏)** | Air Gesture | Drag your index and thumb in front of camera to control teardown distance. |
| **Fist Gesture (✊)** | Air Gesture | Instant reassemble command. |

---

## 🛡️ Dynamic Spec Resolver Matrix

| Device Model | Display Component | Thermal Management | Wireless / Chassis | Biometrics / Selfie |
| :--- | :--- | :--- | :--- | :--- |
| **Infinix Hot 11S** | 6.78" FHD+ 90Hz IPS LCD | Flexible Multi-Layer Graphite Sheet | Mid-Frame Stiffener & NFC | 8MP Dual-Star Selfie + Rear Fingerprint |
| **Infinix Hot 12 Play** | 6.82" 90Hz IPS LCD | Graphene Heat Dissipation Pad | Mid-Frame Polycarbonate Shield | 8MP AI Selfie + Rear Fingerprint |
| **Samsung Galaxy S24 Ultra** | Dynamic AMOLED 2X 120Hz | Bionic Liquid Vapor Chamber | 15W Qi Fast Charging Coil | 12MP Dual Pixel Ultrasonic In-Display |
| **iPhone 15 Pro Max** | Super Retina XDR OLED | Sub-Plate Graphite & Titanium Subframe | MagSafe Ferrite Ring Array | TrueDepth 3D Dot Projector & Face ID |

---

## 🚀 Production Build

To compile a minified, production-ready bundle:

```bash
npm run build
```

The optimized static files will be generated in the `dist/` directory, ready to deploy to Vercel, Netlify, or GitHub Pages.

---

## 👨‍💻 Author

**Denesh**
* GitHub: [@Denesh-developer](https://github.com/Denesh-developer)
* Repository: [augmented-reality-mobile](https://github.com/Denesh-developer/augmented-reality-mobile)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
