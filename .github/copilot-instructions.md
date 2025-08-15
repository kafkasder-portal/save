# Copilot Instructions for Dernek Yönetim Paneli

## Big Picture Architecture
- **Monorepo Structure:** Contains both frontend (`new-panel/`) and backend API (`api/`). Supabase migrations and schemas are in `supabase/`.
- **Frontend:** Built with React 19, TypeScript, Vite, Tailwind CSS. State managed by Zustand. Routing via React Router DOM. Forms use React Hook Form and Zod for validation.
- **Backend:** Node.js/Express API (see `api/server.ts` and `api/routes/index.ts`). Uses Supabase for database and authentication.
- **Database:** Supabase Postgres. Migrations managed via SQL files in `supabase/migrations/` and `supabase/schemas/`.

## Developer Workflows
- **Install dependencies:** `npm install`
- **Start development servers:** `npm run dev` (runs both frontend and backend via `concurrently`)
- **Frontend dev server:** Vite on port 3000
- **Backend dev server:** Express API on port 3002 (proxied via Vite config)
- **Environment variables:** Copy `.env.example` to `.env` and fill in required values
- **Supabase migrations:** Use Supabase CLI (`supabase db diff`, `supabase db reset`, `supabase db push`). See `supabase/schemas/README.md` for details.

## Project-Specific Conventions
- **RBAC:** 6 user roles (Super Admin, Admin, Manager, Coordinator, Operator, Viewer) with granular, module-based permissions. See `src/types/permissions.ts`.
- **Error Handling:** Uses `ErrorBoundary.tsx` for React error boundaries.
- **Loading States:** Skeleton screens and loading indicators are standard (see `Loading.tsx`).
- **Real-time Updates:** Supabase Realtime is enabled (see `.env.example` and `lib/supabase.ts`).
- **Data Table/Analytics:** Custom components for tables and charts (see `DataTable.tsx`, `DashboardCharts.tsx`).
- **QR Code:** Scanning and generation via `QRCodeModal.tsx`, `QRScannerModal.tsx`, and `utils/qrCodeUtils.ts`.
- **State Management:** Use Zustand store files in `src/store/`.
- **API Base URL:** Set via `VITE_API_BASE_URL` in `.env`.

## Integration Points
- **Supabase:** Used for auth, database, and realtime. See `lib/supabase.ts` and migration files.
- **External Services:** WhatsApp, SMS, Email APIs configured via environment variables.
- **Proxy:** Vite proxies `/api` requests to backend (see `vite.config.ts`).

## Key Files/Directories
- `src/components/` — UI components
- `src/pages/` — Route-level pages
- `src/store/` — Zustand state stores
- `src/types/` — TypeScript types for permissions, provision, etc.
- `api/` — Express backend
- `supabase/migrations/` — SQL migration files
- `supabase/schemas/` — Verified schema source

## Example Patterns
- **Permission checks:**
  ```ts
  import { usePermissions } from "../hooks/usePermissions";
  // ...
  const canEdit = permissions.includes("edit_beneficiary");
  ```
- **API calls:**
  ```ts
  import { supabase } from "../lib/supabase";
  const { data, error } = await supabase.from("beneficiaries").select();
  ```
- **State usage:**
  ```ts
  import useAuthStore from "../store/auth";
  const user = useAuthStore((state) => state.user);
  ```

---
If any section is unclear or missing, please provide feedback to improve these instructions.
