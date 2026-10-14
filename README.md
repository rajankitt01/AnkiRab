# ANKIRAB.COM — Modern Anime Streaming and Discovery Platform

> *"Your Anime. Your Language. Your World."*

ANKIRAB.com is a production-oriented, responsive, full-stack anime streaming and discovery platform with first-class multilingual audio and subtitle support (Hindi dubbed, English dubbed, Japanese original audio, English subtitles, Hindi subtitles).

---

## 🌟 Key Features

- **Multilingual Anime Experience**:
  - Filter and stream by **Hindi Dubbed (हिन्दी डब)**, **English Dubbed**, and **Japanese Original Audio**.
  - Synchronized multi-track subtitles (**English Subtitles**, **Hindi Subtitles**).
- **Cinematic Responsive Design**:
  - Dark charcoal aesthetic (`#080A0F`, `#0D1117`, `#161B26`) with purple (`#8B5CF6`) and electric-blue (`#06B6D4`) neon accents.
  - Large interactive hero spotlight, smooth carousels, responsive grid layouts, and loading skeletons.
- **Dedicated Custom HLS Video Player**:
  - Adaptive bitrate HLS streaming using `hls.js`.
  - Dynamic audio track switcher (Hindi, English, Japanese).
  - Subtitle track selector (English, Hindi, Off).
  - Quality selection, playback speed controls (0.75x to 2x), Picture-in-Picture, and full-screen support.
  - Skip opening intro and outro timestamps.
  - Automatic progress tracking and resume playback.
- **Comprehensive Anime Catalog & Discovery**:
  - Search by title and Japanese/Romaji aliases.
  - Filter by Genre, Audio Dub, Subtitles, Format (TV Series, Movie, OVA, Special), Status (Ongoing, Completed), and Year.
  - Sort by popularity, release date, rating, and alphabetical order.
- **Weekly Simulcast Release Schedule**:
  - Broadcast timetable organized by day of week with timezone awareness (`Asia/Kolkata` IST / UTC reference).
- **Personalized User Features**:
  - Watchlist management (Watching, Completed, Plan to Watch, On Hold).
  - Continue watching queue with progress percentage bars.
  - Profile settings to customize default audio & subtitle languages and autoplay preferences.
- **Role-Based Admin Control Center (RBAC)**:
  - Analytics dashboard (total anime, episodes, registered users, playback events, and stream health).
  - Full CRUD management for anime titles, seasons, and episodes.
  - Video stream source, audio track, and subtitle track configurations.
  - User role management (`USER`, `MODERATOR`, `ADMIN`).
  - AniList GraphQL metadata importer.
  - Audit logging for administrative actions.

---

## 🏗️ Architecture & Tech Stack

```
ankirab/
  ├── apps/
  │   ├── web/                 # React 18, Vite, TypeScript, Tailwind CSS, Zustand, TanStack Query
  │   └── api/                 # Node.js, Express, TypeScript, Prisma ORM, JWT, Bcrypt
  ├── packages/
  │   └── shared/              # Shared TypeScript types, DTOs, constants, Zod schemas
  ├── docker-compose.yml       # Production container orchestration
  ├── .env.example             # Template environment variables
  └── README.md
```

### Frontend (`apps/web`)
- **Framework**: React 18 with Vite and TypeScript
- **Styling**: Tailwind CSS with custom ANKIRAB design system
- **Routing**: React Router DOM (v6) with protected and admin route guards
- **State Management**: Zustand (Auth, Player preferences, Toast notifications)
- **Data Fetching**: TanStack Query & custom resilient API client
- **Icons**: Lucide React
- **Media**: HTML5 Video + `hls.js`

### Backend (`apps/api`)
- **Runtime**: Node.js v20+ with Express and TypeScript
- **Database**: PostgreSQL (Production) with SQLite dual-schema support for zero-dependency local dev
- **ORM**: Prisma ORM
- **Authentication**: JWT (Access & Refresh tokens) with secure HTTP-only cookies and bcrypt password hashing
- **Validation**: Zod schema validation middleware
- **Security**: Helmet, CORS, and Express-Rate-Limit
- **Logging**: Morgan and structured internal logger

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- **Node.js**: v20 or higher (v24 supported)
- **npm**: v10 or higher

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-username/ankirab.git
cd ankirab

# Install all monorepo dependencies across workspaces
npm install
```

### 2. Configure Environment Variables

Copy the `.env.example` file to create `.env`:

```bash
cp .env.example .env
cp .env.example apps/api/.env
```

*(Pre-configured defaults are provided for immediate local execution).*

### 3. Initialize Database & Seed Demo Data

The repository includes both PostgreSQL (`prisma/schema.prisma`) and SQLite (`prisma/schema.sqlite.prisma`) configurations. To run with zero setup using local SQLite:

```bash
# Push schema and generate Prisma client
npm run db:push --workspace=@ankirab/api

# Seed catalog, episodes, streams, schedules, and accounts
npm run db:seed --workspace=@ankirab/api
```

### 4. Run Development Servers

Run both the API server (Port 4000) and Web app (Port 5173) concurrently:

```bash
npm run dev
```

Or run individual apps:

```bash
# Start backend API (http://localhost:4000)
npm run dev:api

# Start frontend web app (http://localhost:5173)
npm run dev:web
```

Visit **http://localhost:5173** in your browser.

---

## 🔑 Demo & Admin Credentials

The database seed script provisions two pre-configured accounts:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@ankirab.com` | `AdminSecurePass123!` | Full Admin Dashboard, Catalog CRUD, User Roles, Metadata Import |
| **Demo User** | `demo@ankirab.com` | `DemoUserPass123!` | Watchlist, Watch History, Resume Playback, Profile Preferences |

*(Quick-fill buttons are also available directly on the login modal).*

---

## 🧪 Testing

Execute test suites for both frontend and backend:

```bash
# Run tests across all workspaces
npm test

# Run backend API tests (15 unit/integration tests with Supertest)
npm run test --workspace=@ankirab/api

# Run frontend tests (Vitest + React Testing Library)
npm run test --workspace=@ankirab/web
```

---

## 🛠️ API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create a new user account.
- `POST /api/auth/login` - Authenticate user, set cookie, and return JWT tokens.
- `POST /api/auth/logout` - Invalidate session and clear auth cookie.
- `GET  /api/auth/me` - Retrieve current authenticated user profile.
- `POST /api/auth/forgot-password` - Dispatch password reset token.
- `POST /api/auth/reset-password` - Complete password reset.

### Anime Discovery (`/api/anime`)
- `GET /api/anime` - Paginated anime catalog with filters (`genre`, `format`, `status`, `audioLang`, `subLang`, `sortBy`).
- `GET /api/anime/featured` - Featured hero spotlight titles.
- `GET /api/anime/trending` - Trending titles.
- `GET /api/anime/popular` - Top-rated titles.
- `GET /api/anime/recent` - Recently updated anime.
- `GET /api/anime/hindi-dubbed` - Hindi dubbed releases.
- `GET /api/anime/english-dubbed` - English dubbed releases.
- `GET /api/anime/genres` - Available genre categories.
- `GET /api/anime/:slug` - Full anime metadata with seasons and episode hierarchy.
- `GET /api/anime/:slug/related` - Related anime recommendations.

### Episodes & Streaming (`/api/episodes`)
- `GET  /api/episodes/:id` - Episode details.
- `GET  /api/episodes/:id/playback` - Playback manifest, authorized HLS/MP4 stream URLs, audio tracks, subtitle tracks, and skip timestamps.
- `POST /api/episodes/:id/progress` - Persist playback timestamp for resuming later.

### User Account (`/api/users`)
- `GET    /api/users/me` - Profile information.
- `PATCH  /api/users/me` - Update preferences (default audio, subtitles, auto-play).
- `GET    /api/users/me/watchlist` - Retrieve user's personal watchlist.
- `POST   /api/users/me/watchlist` - Add or update watchlist item status.
- `DELETE /api/users/me/watchlist/:animeId` - Remove from watchlist.
- `GET    /api/users/me/history` - Retrieve watch history with playback positions.
- `DELETE /api/users/me` - Permanently delete account and user data.

### Administration (`/api/admin` - Requires `ADMIN` Role)
- `GET    /api/admin/analytics` - System metrics, total titles, playback sessions, and stream health.
- `GET    /api/admin/anime` - Paginated catalog records for admin table.
- `POST   /api/admin/anime` - Create new anime record.
- `PATCH  /api/admin/anime/:id` - Update anime record.
- `DELETE /api/admin/anime/:id` - Remove anime record.
- `POST   /api/admin/seasons` - Add season to an anime.
- `POST   /api/admin/episodes` - Add episode to a season.
- `POST   /api/admin/episodes/:id/sources` - Attach video stream source.
- `POST   /api/admin/episodes/:id/audio` - Attach audio track.
- `POST   /api/admin/episodes/:id/subtitles` - Attach WebVTT subtitle track.
- `GET    /api/admin/users` - View registered users.
- `PATCH  /api/admin/users/:userId/role` - Update user role (`USER`, `MODERATOR`, `ADMIN`).
- `GET    /api/admin/metadata/import?q=` - Search and import metadata from AniList GraphQL API.

---

## 🎬 Connecting an Authorized Video Provider

ANKIRAB utilizes a provider abstraction layer located in `apps/api/src/providers/video/`:

1. **`IVideoProvider` Interface**:
   ```typescript
   export interface IVideoProvider {
     name: string;
     getPlaybackManifest(episodeId: string, clientIp?: string): Promise<PlaybackManifest>;
     generateSignedUrl(streamUrl: string, ttlSeconds?: number): Promise<string>;
     checkHealth(): Promise<{ status: 'healthy' | 'degraded' | 'down'; latencyMs: number }>;
   }
   ```
2. **`DemoVideoProvider`**: Active by default in development. Delivers certified public-domain test streams (adaptive HLS and MP4) with multi-audio (Hindi, English, Japanese) and WebVTT subtitles.
3. **`AuthorizedHlsProvider`**: Reads configured video sources, audio tracks, and subtitle tracks directly from the database, allowing you to plug in licensed streams or signed CDN URLs (Akamai, AWS CloudFront, Cloudflare Stream, or Fastly).
4. **Attaching Streams via Admin**: Navigate to `/admin` &rarr; Add Video Source to configure your authorized CDN URLs.

---

## 🐳 Docker Deployment

To build and run the entire stack (PostgreSQL, Express API, and Nginx Web App) using Docker Compose:

```bash
# Build and run containers in background
docker compose up -d --build

# Run database migration on postgres container
docker compose exec api npx prisma db push --schema=prisma/schema.prisma

# Seed initial data
docker compose exec api npx tsx prisma/seed.ts
```

- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:4000
- **PostgreSQL**: localhost:5432

---

## 📄 License & Compliance

ANKIRAB is designed with strict compliance in mind. All streaming integrations rely on authorized provider interfaces, signed tokens, and public-domain or authorized media. Redistribution of copyrighted works without permission is prohibited.

Designed & built for **ANKIRAB.COM**.
