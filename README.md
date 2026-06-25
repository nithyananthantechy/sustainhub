# SustainHub MVP - Corporate ESG & Operational Helpdesk

A full-stack MVP application integrating real-time telemetry metrics, corporate Social and Environmental Responsibility (CSR) statistics (with automatic SharePoint list sync), and a ticketing helpdesk system.

---

## Technical Architecture Overview

```
┌─────────────────────────────────────────┐
│     React + Vite + Tailwind (Port 5173) │  Frontend
└────────────────┬────────────────────────┘
                 │ Axios + Socket.io (WebSocket)
┌────────────────▼────────────────────────┐
│  Express.js + TypeScript (Port 5000)    │  Backend
│        ↓
│  Prisma ORM
│        ↓
│  PostgreSQL (Port 5432)                 │  Database
└─────────────────────────────────────────┘
```

- **Frontend**: React 18, Vite, Recharts, Lucide Icons, Socket.io-client, Tailwind CSS v3
- **Backend**: Node.js, Express, TypeScript, Socket.io, Zod, BcryptJS, JWT, Helmet, Express-rate-limit
- **Database**: PostgreSQL (Prisma ORM)
- **Real-Time updates**: WebSockets (Socket.io)
- **Data Synchronization**: Microsoft Graph REST Client (OAuth 2.0 Client Credentials flow)

---

## Workspace Structure

```
sustainhub/
├── backend/
│   ├── src/                    # TypeScript Express source code
│   │   ├── config/             # Database connection initializers
│   │   ├── controllers/        # Route controllers (Auth, CSR, Stats, Tickets, Dashboard)
│   │   ├── middleware/         # Middlewares (Auth, Validation, Errors)
│   │   ├── routes/             # Express routes
│   │   ├── services/           # Socket.io, Microsoft Graph SharePoint synchronizer
│   │   └── types/              # Custom express request typings
│   ├── prisma/
│   │   └── schema.prisma       # Database mapping schema
│   ├── .env.example
│   ├── tsconfig.json
│   └── Dockerfile              # Multi-stage production container setup
├── frontend/
│   ├── src/
│   │   ├── components/         # Dashboard layout, Metrics Cards, Line charts
│   │   ├── context/            # Auth session and WebSocket contexts
│   │   ├── pages/              # Portal pages (Dashboard, Login, Tickets, Settings, Embed Widget)
│   │   └── main.tsx & index.css
│   ├── .env.example
│   ├── tailwind.config.js & postcss.config.js
│   ├── index.html
│   └── vercel.json             # Vercel client-side rewrites rule configuration
└── README.md                   # Setup guide (This file)
```

---

## Local Setup & Development Guide

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [PostgreSQL](https://www.postgresql.org/) v14 or later (running on standard port 5432)

---

### Step 1: Database Initialization

1. Create a database in your local PostgreSQL shell:
   ```bash
   createdb community_webapp
   ```
2. Make sure you have the `uuid-ossp` extension enabled if required, though Prisma's `uuid()` will handle UUID generation gracefully inside the client layer.

---

### Step 2: Backend Configuration & Start

1. Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Configure your environment variables. Copy the `.env.example` into a new `.env` file:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` to configure your PostgreSQL credentials in the `DATABASE_URL` string:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/community_webapp?schema=public"
   ```
4. Push the schema migrations into the database to build all tables:
   ```bash
   npm run prisma:push
   ```
5. Start the development server (runs with hot reloading on port 5000):
   ```bash
   npm run dev
   ```

---

### Step 3: Frontend Configuration & Start

1. Open a new terminal workspace, navigate to the frontend directory and install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Establish your local environment settings. Copy the `.env.example` to a new `.env` file:
   ```bash
   cp .env.example .env
   ```
3. Start the Vite server (runs on port 5173):
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to: `http://localhost:5173`

---

## Testing Scenarios & Checklist

### 1. Account Creation & Navigation
- Click **Register Corporate Admin** on the login page.
- Register a test company profile (e.g. Acme Inc, email `admin@acme.com`).
- Observe redirection to the dashboard, verifying your company profile is populated.

### 2. Live Ticket Submission (Real-Time Alert)
- Open `http://localhost:5173` and log in with your admin credentials.
- In another browser tab or private frame, open the public widget path:
  `http://localhost:5173/widget?company_id=YOUR_COMPANY_UUID`
  *(You can copy your Company UUID from the browser URL address bar or your dashboard settings page).*
- Submit an inquiry anonymously inside the widget form.
- Switch back to the dashboard tab and verify a slide-in **New Support Ticket** alert pops up instantly at the bottom-right corner!

### 3. External API Stats Pushes
- Copy the **Developer Integration Token** from the dashboard settings page.
- Submit a telemetry stat from a separate shell console (e.g., cmd/bash) using `curl`:
  ```bash
  curl -X POST http://localhost:5000/api/stats \
    -H "Content-Type: application/json" \
    -H "X-API-KEY: YOUR_COPIED_DEVELOPER_KEY" \
    -d '{"statName": "Server Response", "statValue": 142.5, "statUnit": "ms"}'
  ```
- Verify the new operational statistics entry registers instantly inside your dashboard telemetry trend graphs.

### 4. Microsoft Graph SharePoint Sync
- By default, if Microsoft Graph credentials (`SHAREPOINT_CLIENT_SECRET`) are not set in the `.env` file, the backend gracefully runs a **Simulated Sync** process.
- Click **Sync SharePoint** on the dashboard header (or wait for the 30-minute interval scheduler).
- A simulated sync runs, loading mock sustainability metrics (carbon footprint, recycled waste ratio, volunteer hours) to populate the dashboard metrics widgets.

---

## Embeddable Widget Integration

To embed the read-only CSR metrics feed and anonymous ticket submission form inside third-party company websites, load the target URL inside an `<iframe>` container:

```html
<!-- Emerald Branding Widget Template -->
<iframe
  src="http://localhost:5173/widget?company_id=YOUR_COMPANY_UUID&brand=emerald"
  width="100%"
  height="600"
  style="border: none; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);"
  title="Sustainability Dashboard Feed"
></iframe>
```

### Brand Color Overrides
Customize branding using the query parameter `brand`:
- `?brand=indigo` (Default slate-indigo theme)
- `?brand=emerald` (Sustainability green theme)
- `?brand=teal` (Teal theme)
- `?brand=rose` (Warm rose theme)

### postMessage Listener API
The widget sends event payloads to the parent window upon ticket submissions. Register a listener in the host page to display confirmation modals:
```javascript
window.addEventListener('message', (event) => {
  if (event.data.event === 'ticket:submitted') {
    console.log('Ticket saved on database successfully!', event.data.ticketId);
    // Execute custom page scripts here
  }
});
```
