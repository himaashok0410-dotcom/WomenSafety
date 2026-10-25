# SafeHer — Your Journey. Your Choice. Your Safety.

> **Hackathon Submission for recHERsion’26**  
> Organized by **ACM-W, NITK Surathkal**  
> Domain: **Women’s Safety**  
> Team: **SafeHer Engineering**

---

## 🌟 Executive Summary & Problem Statement

Women in urban and suburban India navigate daily vulnerabilities when commuting alone, taking late-night transit, traversing unfamiliar campus corridors, or dealing with harassment. Existing safety solutions often fail for three critical reasons:
1. **Accidental false alarms or complex activation** — Panic buttons triggered accidentally in bags cause alarm fatigue, or multi-step apps take too long under duress.
2. **All-or-nothing tracking that violates privacy** — Continuous surveillance apps expose private location history permanently to third parties.
3. **Misleading rescue guarantees** — Apps that falsely imply police will instantly deploy when an SOS is tapped, leading to a false sense of security.

**SafeHer** is a responsive, mobile-first web application designed with honesty, speed, and privacy at its core. It provides intentional hold-to-activate emergency broadcasting, revocable peer-to-peer live journey sharing, proactive check-in accountability, verified Indian helpline integration (112, 1091, 181, 1090), and situational de-escalation tools (including a realistic incoming fake call generator).

---

## 🚀 Key Features

### 1. Emergency Assistance & Intentional SOS
- **Hold-to-Activate Interaction (2.5s):** Eliminates accidental pocket taps through smooth circular SVG progress visual feedback and haptic vibration.
- **5-Second Safeguard Countdown:** Allows instant cancellation if triggered by mistake before notification dispatch.
- **Direct 112 Dialing Shortcut:** Clear national emergency calling (`tel:112`) for police, medical, and fire emergency response.
- **Explicit Location Attachment:** Consented GPS coordinates packaged into a Google Maps URL (`https://maps.google.com/?q=lat,lng`).
- **Emergency Dispatch Network:** Alerts verified emergency contacts. In demo mode, clearly labels simulated dispatch with direct one-click WhatsApp dispatch links for manual sending.
- **Distress Cancellation:** User can mark "I am safe now" with audit reasoning.

### 2. Trusted Contacts Network
- **Secure CRUD Management:** Add, edit, prioritize, and delete contacts with Indian mobile number validation (10 digits / +91).
- **Emergency Priority Flag:** Designate which contacts receive immediate SOS broadcasts.
- **Direct Testing:** One-click WhatsApp message and direct phone call links for immediate reachability testing.
- **Strict Privacy:** Contact data is encrypted and bound to authenticated user accounts; never exposed publicly or indexed.

### 3. Safe Journey & Revocable Sharing
- **Commute Tracking:** Define starting point, destination, and estimated arrival time (ETA).
- **Unguessable Revocable Tokens:** Generates cryptographic tokens (`/shared/:token`) that can be shared with parents or friends without requiring them to install an app or create an account.
- **Public Contact Viewer:** Read-only view for trusted contacts displaying destination, current status (`In Transit`, `Safely Arrived`, `Link Revoked`), and last reported GPS coordinates.
- **One-Click Revocation:** Traveler can revoke tracking links at any moment, terminating public visibility immediately.
- **Device Transparency:** Explains browser limitations honestly—continuous background tracking requires active browser sessions.

### 4. Safety Check-In Timer
- **Proactive Accountability:** Set 5, 15, 30, or 60-minute timers before walking through isolated campus zones or taking cabs.
- **Visual Countdown Clock:** Real-time countdown synced with backend server deadlines.
- **One-Tap "I'm Safe" Confirmation:** Confirms safety and clears timer.
- **Overdue Flagging:** Backend flags overdue check-ins when expected arrival times are exceeded.

### 5. Safety Resource Centre & Helplines
- **Verified India Helplines:**
  - `112`: National All-in-One Emergency (Police, Fire, Ambulance)
  - `1091`: Women Police Helpline (24/7 Toll-Free)
  - `181`: Women in Distress Helpline (NCW)
  - `1090`: Women Power Line (Anti-Stalking & Harassment)
  - `1930`: National Cyber Crime Reporting Portal
  - `1098`: Childline India
  - `+91 72177 35372`: NCW 24/7 WhatsApp Grievance
- **Legal Rights Guide:** Explains the **Zero FIR** under Indian criminal law (mandating any police station to register an FIR irrespective of jurisdiction), right to free legal aid, and privacy rights during statement recording.
- **Evidence Preservation Guide:** Practical steps for preserving cyberstalking screenshots, metadata, and maintaining chain-of-custody.
- **Interactive Readiness Checklist:** Check off essential commute precautions with saveable progress.

### 6. Discreet Escape: Fake Incoming Call Simulator
- Realistic incoming call screen with customizable caller ID (*Dad*, *Mom*, *Inspector Rao*, *Hostel Warden*).
- Timed delays (3s, 10s, 30s) and authentic call connection UI with live talk-time counter, giving women an immediate polite pretext to exit unsafe situations.

### 7. User Authentication & 1-Click Judge Evaluation
- Secure JWT authentication with bcrypt password hashing.
- **1-Click Demo Login (`Priya Sharma`):** Pre-seeded with realistic contacts and journey data so hackathon judges can test all features in seconds without tedious form entry.

---

## 🛠️ Technology Stack & Architecture

```
                      ┌───────────────────────────────────────────────┐
                      │              SafeHer Web Client               │
                      │  React 18 + Vite + Mobile-First Vanilla CSS   │
                      └──────────────────────┬────────────────────────┘
                                             │ REST API (JSON)
                                             ▼
                      ┌───────────────────────────────────────────────┐
                      │             SafeHer Express Server            │
                      │       Node.js + Express + JWT + Bcrypt        │
                      └───────┬───────────────────────────────┬───────┘
                              │                               │
                              ▼                               ▼
               ┌──────────────────────────────┐ ┌──────────────────────────────┐
               │    MongoDB Atlas (Mongoose)  │ │ Development Fallback Store   │
               │  Active when MONGO_URI is set│ │ Persistent JSON data store   │
               └──────────────────────────────┘ └──────────────────────────────┘
```

- **Frontend:** React 18, Vite, Vanilla CSS (modular design tokens, glassmorphism, responsive navigation), Lucide React Icons.
- **Backend:** Node.js, Express, `jsonwebtoken` (JWT), `bcryptjs`, `express-rate-limit`, `cors`, `dotenv`.
- **Database:** Mongoose / MongoDB Atlas with an automatic **Development Fallback JSON Storage Engine** in `server/data/` ensuring 100% functionality out-of-the-box even without database credentials.
- **Testing:** Node.js 24 native test runner (`node:test`) + `supertest` for comprehensive end-to-end route testing.

---

## 🧪 Automated Testing Verification

The backend includes a comprehensive automated test suite verifying all core routes and security constraints:

```bash
cd server
npm test
```

### Test Suite Results:
```
▶ SafeHer API Automated Integration Suite
  ✔ 1. Health check endpoint responds with service details and DB mode (75ms)
  ✔ 2. Safety resources endpoints return verified helplines, guides, and checklist (37ms)
  ✔ 3. Auth validation: rejects registration without required fields or invalid email (71ms)
  ✔ 4. Registration: successfully registers a new user with hashed password (380ms)
  ✔ 5. Auth login: authenticates registered user and returns token (250ms)
  ✔ 6. Unauthorized protection: rejects access to private endpoints without token (11ms)
  ✔ 7. Trusted Contacts: creates, reads, updates, and deletes contacts with validation (46ms)
  ✔ 8. Safe Journey: starts journey, generates revocable share token, updates location, and ends journey (39ms)
  ✔ 9. Safety Check-In: creates timer, checks remaining seconds, and confirms safe (30ms)
  ✔ 10. Emergency SOS Alert: triggers alert with coordinates, dispatches to contacts, and cancels with reason (28ms)
✔ SafeHer API Automated Integration Suite (982ms)
ℹ pass 11
ℹ fail 0
```

Frontend production build was verified via `vite build`:
```
dist/index.html                   1.07 kB │ gzip:  0.59 kB
dist/assets/index-B7k2Ucdk.css   12.06 kB │ gzip:  3.38 kB
dist/assets/index-f_bbY-s8.js   242.03 kB │ gzip: 67.23 kB
✓ built in 5.04s with 0 errors
```

---

## 🏃 Local Setup & Running Instructions

### Prerequisites
- Node.js v18+ or v24+
- npm v9+

### Step 1: Clone the Repository
```bash
git clone <repository_url>
cd WomenSafety
```

### Step 2: Start the Backend Server
```bash
cd server
npm install
npm start
```
*The server will run on `http://localhost:5000` with the health check at `http://localhost:5000/api/health`.*

### Step 3: Start the Frontend Client
In a new terminal:
```bash
cd client
npm install
npm run dev
```
*The application will open on `http://localhost:5173`.*

### Quick Judge Evaluation
1. Open `http://localhost:5173`.
2. Click **"Launch Demo as Priya (Judge 1-Click)"** or sign in using the demo button on the login screen.
3. Test **Hold-to-Activate SOS**, **Safe Journey** sharing, **Check-In timer**, **Fake Call simulator**, and **Resource helplines**.

---

## 🚢 Deployment Configuration

### Frontend (Vercel)
- **Framework Preset:** Vite
- **Root Directory:** `client`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variable:** `VITE_API_URL` set to the deployed backend URL.
- SPA rewrite is configured in `client/vercel.json`.

### Backend (Render)
- **Environment:** Node
- **Root Directory:** `server`
- **Build Command:** `npm install`
- **Start Command:** `node src/index.js`
- Blueprint configuration is provided in `server/render.yaml`.
- Environment Variables:
  - `PORT`: `5000`
  - `NODE_ENV`: `production`
  - `JWT_SECRET`: Random 32+ character string
  - `CLIENT_ORIGIN`: Your frontend Vercel URL
  - `MONGO_URI`: (Optional) MongoDB Atlas Connection string

---

## ⚖️ Implemented vs. Future Roadmap

| Feature | Status | Notes |
| :--- | :---: | :--- |
| Hold-to-Activate SOS (2.5s) | ✅ Implemented | Radial SVG progress with haptic vibration |
| 5s Accidental Trigger Safeguard | ✅ Implemented | Countdown cancellation dialog |
| Direct 112 India Calling Shortcut | ✅ Implemented | Pre-configured `tel:112` protocol link |
| GPS Location Capture & Maps Link | ✅ Implemented | High accuracy browser geolocation |
| Trusted Contacts CRUD & Validation | ✅ Implemented | Private authenticated contact network |
| Revocable Journey Share Links | ✅ Implemented | Public contact viewer via unguessable tokens |
| Safety Check-In Timer | ✅ Implemented | Syncs remaining duration with backend |
| Verified Helplines Directory (India) | ✅ Implemented | 112, 1091, 181, 1090, 1930, NCW |
| Legal Rights & Zero FIR Guide | ✅ Implemented | Clear citizen rights education |
| Fake Call Escape Simulator | ✅ Implemented | Incoming call UI with audio simulation |
| 1-Click Demo Login for Judges | ✅ Implemented | Instant login with seeded data |
| Production Twilio SMS/WhatsApp Gateway | ⏳ Ready | Configurable via `TWILIO_*` env vars |
| Native Background Geofencing | 🔮 Future | Requires native Android/iOS wrapper (Capacitor) |

---

## 🎤 2-Minute Hackathon Demo Script

- **[0:00 - 0:25] The Hook & Problem:**  
  *"Good morning judges. I'm presenting SafeHer for recHERsion'26. As a student traveling back from campus or traveling late in cabs, emergency safety apps often fail us—either triggering accidental false alarms in our backpacks, or making false promises that an app alone can summon the police. SafeHer changes this with intentionality, privacy, and transparency."*

- **[0:25 - 0:50] The 1-Click Evaluation & Intentional SOS:**  
  *"Let's jump straight in with our 1-click demo login as Priya. Notice the hero SOS button. A simple accidental tap does not trigger panic. It requires a firm 2.5-second hold with visual radial progress. Even after release, a 5-second safeguard countdown allows immediate cancellation. When dispatched, our backend packages Priya's exact GPS coordinates into a Google Maps link and alerts her emergency contacts, while immediately offering a direct dial shortcut to India's 112 police emergency service."*

- **[0:50 - 1:20] Safe Journey & Revocable Sharing:**  
  *"Now let's start a journey: from NITK Surathkal to Mangalore Central. SafeHer generates a cryptographic, unguessable tracking link. Let's open it in an incognito window. Her brother or mother can view her live route, destination, and ETA without having to download an app or register an account. And the moment Priya reaches her destination, she taps 'I Have Arrived' or 'Revoke Link', instantly terminating public access."*

- **[1:20 - 1:45] Check-In Timer & Fake Call Discreet Escape:**  
  *"If Priya is walking across an isolated corridor, she arms a 15-minute Safety Check-In timer. If an awkward or threatening situation arises in an auto, she arms our Fake Call tool. In 3 seconds, her phone rings realistically with an incoming call from 'Dad', giving her an immediate polite excuse to step away."*

- **[1:45 - 2:00] Architecture & Closing:**  
  *"SafeHer is fully tested with 11 automated backend integration tests passing in under one second, responsive across mobile viewports, and backed by a dual-engine architecture supporting MongoDB Atlas with an automatic local fallback. SafeHer: Your Journey. Your Choice. Your Safety. Thank you!"*

---

## 📊 5-Slide Presentation Outline

### Slide 1: Title & Vision
- **Header:** SafeHer — Your Journey. Your Choice. Your Safety.
- **Sub-header:** A Privacy-Centric, Practical Women’s Safety Web Platform.
- **Details:** Built for recHERsion’26 (ACM-W, NITK Surathkal).
- **Core Message:** Bridging the gap between reactive emergency distress and proactive daily safety.

### Slide 2: The Real-World Problems
- **Problem A:** Accidental panic button triggers leading to desensitized families.
- **Problem B:** Continuous privacy-invasive tracking by commercial apps.
- **Problem C:** Misleading rescue guarantees that ignore browser/device limitations.

### Slide 3: The SafeHer Solution Architecture
- **Hold-to-Activate SOS:** 2.5s hold + 5s countdown safeguard to prevent false alarms.
- **Revocable Share Links:** Ephemeral, tokenized journey tracking for family.
- **Proactive Accountability:** Check-in countdown timers with "I'm Safe" confirmations.
- **De-escalation & Legal Rights:** Fake call simulator + verified India helplines & Zero FIR guide.

### Slide 4: Technology & Engineering Rigor
- **Frontend:** React 18, Vite, Mobile-first Vanilla CSS design system.
- **Backend:** Node.js Express REST API, JWT auth, Bcrypt security.
- **Database Resilience:** MongoDB Atlas Mongoose + Zero-config Persistent JSON Fallback.
- **Quality Assurance:** 11/11 automated integration tests passing, production Vite build verified.

### Slide 5: Social Impact & Next Steps
- **Immediate Impact:** Safe, practical tool for university students and working women.
- **Next Horizon:** Capacitor wrapper for native background geofencing & offline SMS mesh fallback.
- **Tagline:** Empowering independence through honest engineering.

---

## 🔒 Privacy & Limitation Disclaimer
*SafeHer prioritizes user consent and data minimization. GPS coordinates are collected only upon explicit browser permission. Web browser applications cannot execute continuous background location tracking when the device is locked or the browser is terminated. In life-threatening emergencies, users are urged to dial 112 directly.*
