# AssetFlow — Enterprise Asset & Resource Management System

AssetFlow is a premium, enterprise-grade SaaS application designed to manage physical inventory, hardware lifecycles, shared office reservations, repair tickets, and compliance cycles. The user experience and interface are heavily inspired by the minimal, high-speed, and polished design philosophy of **Linear**, featuring dark/light modes, Geist typography, slide-over drawer layouts, and keyboard-first command bars.

---

## 🌟 UI/UX Design System Highlights

* **Double Theme Support**: Toggle seamlessly between Light Mode and Dark Mode. Local storage preserves user selection.
* **Geist Typography**: Tailored typography hierarchy using Geist and Inter fonts with lighter, elegant font weights.
* **Command Palette (`⌘K` / `Ctrl+K`)**: Floating action command bar (inspired by Raycast/Linear) offering search triggers, theme switching, logouts, and page navigation.
* **Drawer-First Modals**: Slide-over panels from the right side for complex forms and inspection items, reducing dashboard clutter.
* **Premium Data Tables**: Sticky headings, hover highlighting, status indicators, and skeleton loaders to avoid blank layouts during data loading.
* **Smooth Transitions**: Fluid 60 FPS transitions powered by `framer-motion` on page loads, drawers, tooltips, and dropdown panels.

---

## 🛠 Features Matrix

1. **Asset Inventory**: Record and tag central systems, laptops, developer configurations, and devices. Generate and inspect verified QR codes.
2. **Facility Scheduling**: Overlap validation scheduling board to reserve conference rooms, labs, or demo vehicles.
3. **Repairs & Maintenance**: Malfunction incident logging, support prioritization, dispatcher assignments, and ticket closures.
4. **Compliance Audits**: Launch scoped audit checking cycles, register verification inputs, and compile missing/damaged inventory discrepancy reports.
5. **Staff Directory**: Active access controls to browse company employees and assign security roles.
6. **Master Organization Setup**: Admin control interface to manage corporate departments, asset categories, and custom dynamic specifications.
7. **Reports & Analytics**: High-quality analytical area, donut, and distribution graphs powered by Recharts.

---

## 💻 Tech Stack

### Frontend
* **Core**: React 19, Vite, Tailwind CSS v4
* **State Management**: Redux Toolkit, Redux React
* **Routing**: React Router DOM (v7)
* **Animations**: Framer Motion
* **Analytics**: Recharts
* **Icons**: Lucide React

### Backend
* **Language**: Python
* **Web Framework**: FastAPI / Starlette routers
* **Authentication**: OAuth (Google) & 6-digit OTP verification code verification

---

## 🚀 Setup & Launch Guidelines

### Prerequisites
* **Node.js**: `v18+`
* **Python**: `v3.10+`

### 1. Backend Launch
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Configure `.env` using `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Set up a virtual environment and install packages:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
4. Run the API server:
   ```bash
   python main.py
   ```

### 2. Frontend Launch
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the hot-reloading development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your web browser.

---

## 🎨 Spacing & Color Standards
Consistent with the Linear-inspired design tokens:
* **Dark Mode Bg**: `#09090B` (Primary), `#111113` (Secondary)
* **Light Mode Bg**: `#FFFFFF` (Primary), `#FAFAFA` (Secondary)
* **Accent Purple**: `#5E6AD2`
* **Spacing**: Consistent 8px grids (Paddings, Margins, Borders)
* **Borders**: Lighter margins (`1px` width) with soft color contrasts
