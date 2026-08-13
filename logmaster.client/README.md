# LogMaster Pro — Frontend

React + TypeScript + Vite frontend for LogMaster Pro, built against the ASP.NET Core / EF Core backend. Styled around a "fleet dispatch console" theme, with the trip detail view's signature component modeled on a real hours-of-service log sheet (a 24-hour duty-status timeline).

## Setup

```bash
npm install
cp .env.example .env   # then point VITE_API_BASE_URL at your running API
npm run dev
```

## Structure

```
src/
  api/            axios client + typed request functions (trips, auth)
  components/     Layout, LogStrip (signature duty-status chart), StatusBadge, ProtectedRoute
  context/        AuthContext — login/logout state, JWT persisted to localStorage
  pages/          LoginPage, DashboardPage, TripsPage, TripDetailPage
  types/          shared TS interfaces matching the API's Trip / LogEntry shape
```

## Backend contract this expects

- `POST /api/auth/login` → `{ token, user }`
- `GET /api/trips` → `Trip[]`
- `GET /api/trips/{id}` → `Trip`
- `GET /api/trips/{id}/log-entries` → `LogEntry[]` (matches the endpoint already working in the backend)
- `POST /api/trips/{id}/log-entries` → `LogEntry`
- `GET /api/dashboard/summary` → `DashboardSummary`

Adjust `src/types/index.ts` and `src/api/trips.ts` if your actual DTO shapes differ (e.g. field naming casing from C#'s default camelCase JSON serialization should match, but double check enum serialization for `DutyStatus` — ASP.NET Core sometimes serializes enums as strings vs. numbers depending on `JsonStringEnumConverter` config).

## Notes

- Auth is a simple JWT-in-localStorage pattern with an axios interceptor attaching the token and redirecting to `/login` on a 401.
- The dashboard summary endpoint doesn't exist in the backend yet based on what's been built so far — you'll need to add a `/dashboard/summary` endpoint, or wire the page to derive these numbers client-side from the trips list as a first pass.
- Tailwind theme tokens (colors, fonts) live in `tailwind.config.js` under the `dispatch` color namespace.
