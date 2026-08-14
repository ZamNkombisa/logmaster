# 🚛 LogMaster

LogMaster is a full-stack Electronic Logging Device (ELD) app I built to replace the old paper driver's-log workflow with something digital. I used it as a way to properly learn ASP.NET Core, EF Core, and building a real backend from scratch — on top of that I added JWT auth, live GPS tracking with SignalR, an FMCSA-style compliance rule engine, and a chat assistant that answers questions about a trip using its real data.

There are three roles, and each one sees something different: **Drivers** log their trips and duty status, **Dispatchers** keep an eye on the whole fleet, and **Admins** manage users and system data.

---

## Table of contents

- [Features]
- [Tech stack]
- [How it's structured]
- [Running it locally]
- [Environment variables]
- [The HOS compliance rules]
- [Compliance Copilot]
- [Live GPS tracking]
- [Things I know aren't perfect]

---

## Features

### 🧑‍✈️ Driver
- Start a trip by searching pickup/dropoff addresses — distance and average speed get calculated automatically from real routing data, no typing numbers in by hand
- A live map showing the route
- Live GPS position sent while a trip is active
- A visual duty-status timeline (Off Duty / Sleeper Berth / Driving / On Duty Not Driving)
- If you forget to log a new status, the system automatically keeps the timeline going as "Driving" after the last logged status runs out — shown dimmed so it's clear it was auto-filled, not something you actually entered
- End the trip when you're done

### 🧭 Dispatcher
- A dashboard showing active trips, flagged trips, and drivers currently on duty
- Full list of every driver's trips, filterable by All / Active / Completed / Flagged
- Open any trip to see full details, the live map, the duty log, and any compliance flags
- Run a compliance check on a trip whenever needed
- Ask the **Compliance Copilot** things like "why is this flagged?" and get an answer based on that trip's actual data
- Manage drivers and vehicles
- Mark trips complete

### 🛠️ Admin
- Everything a Dispatcher can do, plus:
- Manage users and change their roles
- See system-wide numbers: total users, drivers, vehicles, and violations over the last 30 days

---

## Tech stack

**Backend**
- ASP.NET Core 10 Web API (C#)
- Entity Framework Core, talking to an Azure SQL Database (free tier)
- ASP.NET Core Identity + JWT auth, with role-based permissions
- SignalR for live GPS updates over a WebSocket connection
- Split into Controllers → Services → Repositories, so each layer only does one job
- Groq's API (Llama 3.3 70B) powering the Compliance Copilot

**Frontend**
- React + TypeScript, built with Vite
- Tailwind CSS with a small custom color palette
- React Router, with different routes available depending on your role
- Axios, with the JWT attached automatically and a redirect to login if a token expires
- React-Leaflet for maps (dark map tiles from CARTO)
- Nominatim for address search, OSRM for calculating real driving routes/distances
- SignalR's JS client for receiving live position updates

---

## How it's structured

```
React frontend  <──REST/JWT──>  ASP.NET Core API  <──>  Azure SQL Database
     │                                 │
     └──────── SignalR (WS) ──────────┘
```

On the backend, I kept things split into three layers:
- **Controllers** just handle the HTTP request/response, nothing else
- **Services** hold the actual logic — validation, the compliance rule engine, building the context sent to the Copilot
- **Repositories** wrap EF Core, so the rest of the app doesn't need to know it's talking to SQL Server specifically

Most entities share one generic repository (`Repository<T>`) for basic CRUD. Trips needed a bit more — loading related data, filtering by driver, so I added a specific `ITripRepository` on top rather than making the generic one more complicated for everyone else.

---

## Running it locally

### You'll need
- .NET 10 SDK
- Node.js 18+
- A free Azure account (Azure SQL's free tier covers this)
- A free [Groq API key](https://console.groq.com) — no card needed

### Backend

```bash
cd logmaster.api

dotnet tool install --global dotnet-ef

dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "<your Azure SQL connection string>"
dotnet user-secrets set "Jwt:Key" "<a random 32+ character string>"
dotnet user-secrets set "Groq:ApiKey" "<your Groq API key>"

dotnet ef database update
dotnet run
```

Runs at `https://localhost:5117` (check your terminal, the port can vary). Swagger's at `/swagger/index.html`.

### Frontend

```bash
cd logmaster.client
npm install
```

Create a `.env` file:
```
VITE_API_BASE_URL=https://localhost:5117/api
```

```bash
npm run dev
```

Runs at `http://localhost:5173`.

---

## Environment variables

Nothing sensitive is committed — the backend uses `dotnet user-secrets`, the frontend uses a gitignored `.env`.

| Variable | Where | What it's for |
|---|---|---|
| `ConnectionStrings:DefaultConnection` | Backend secrets | Azure SQL connection string |
| `Jwt:Key` | Backend secrets | Signs the JWTs |
| `Jwt:Issuer` / `Jwt:Audience` | `appsettings.json` | Not sensitive, safe to commit |
| `Groq:ApiKey` | Backend secrets | For the Compliance Copilot |
| `VITE_API_BASE_URL` | Frontend `.env` | Where the frontend calls the API |

---

## The HOS compliance rules

The rule engine (`Services/Compliance/HosComplianceEngine.cs`) checks a trip's duty log against four rules based on FMCSA hours-of-service regulations:

| Rule | What it checks |
|---|---|
| `HOS-11HR-DRIVING` | More than 11 hours of driving in the trip |
| `HOS-14HR-WINDOW` | On-duty window (start to end) longer than 14 hours |
| `HOS-8HR-BREAK` | More than 8 hours of driving without a 30-minute break |
| `HOS-10HR-RESET` | Less than 10 hours off duty before this trip started |

Compliance is checked when you click "Evaluate compliance," not automatically after every log entry, mainly because the reset rule needs to look back at the driver's previous trip, so it made more sense to recheck everything at once rather than try to track it incrementally.

---

## Compliance Copilot

This is a small chat assistant scoped to one trip at a time, not a general chatbot that knows about your whole fleet.

When you ask it something, here's what actually happens:
1. The backend pulls that trip's real data — driver, vehicle, the full duty log, and any flags already recorded
2. That data gets formatted and added to the prompt sent to the LLM, along with an instruction to only answer from what's given and say so if it doesn't know
3. Groq's Llama 3.3 70B generates the answer, which comes back to the chat widget

I didn't use a vector database for this, the amount of data per question is small and scoped to one trip, so a full embeddings/RAG pipeline would've been overkill. It's still genuinely retrieval-based, just simpler than that.

You'll find it as a floating chat button on the trip detail page (Admin/Dispatcher only for now).

---

## Live GPS tracking

While a driver has a trip going, their browser sends their location over a SignalR WebSocket connection. The backend then sends that update to:
- The driver's own map
- Any Dispatcher/Admin watching the fleet live

One thing that tripped me up building this: browsers can't set an Authorization header during a WebSocket handshake, so the JWT gets passed as a query parameter instead, and the backend is configured to accept that specifically for requests to `/hubs`.

---

## Things I know aren't perfect

Being upfront about this rather than pretending everything's flawless:

- Testing GPS from a laptop uses browser-based location (Wi-Fi/network based), not real GPS, it can jump around indoors. Works fine on an actual phone.
- The auto duty-status feature checks every minute, so it's not exact to the second.
- Address search and routing use free public services (Nominatim/OSRM) with fairly low rate limits, fine for this project, wouldn't hold up at real scale.
- The Azure SQL firewall is currently open pretty wide, since my home IP kept changing while developing. I will lock that down properly on the second version.
- The compliance engine covers 4 core rules, not the full FMCSA rulebook (e.g. the 60/70-hour 7/8-day cycle isn't in there yet).
- No automated tests yet.

---

## Author

Built by Zamuxolo Nkombisa — [GitHub](https://github.com/ZamNkombisa) · [LinkedIn](https://www.linkedin.com/in/zamuxolo-nkombisa-201b47a6/)
