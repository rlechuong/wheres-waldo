# Where's Waldo

https://www.theodinproject.com/lessons/nodejs-where-s-waldo-a-photo-tagging-app

**[Frontend](https://rlechuong-wheres-waldo.netlify.app/)** / [Backend](https://wheres-waldoapi-production.up.railway.app/health) / [Github](https://github.com/rlechuong/wheres-waldo)

## Features

- Three scenes with six hidden characters each
- Targeting box marks your click and a menu lists characters you haven't found yet
- Server-side validation for guesses and time
- Continual game sessions persisting through tab refresh/close
- Leaderboards per scene with the top 20 times

## Tech Stack

| Layer    | Choices                                                                     |
| -------- | --------------------------------------------------------------------------- |
| Frontend | React 19, Vite 8, React Router 8 (Data), TanStack Query 5, CSS Modules      |
| Backend  | Node 22, Express 5, Prisma 7, Zod 4                                         |
| Database | PostgreSQL 16                                                               |
| Testing  | Vitest 5, Supertest 7                                                       |
| Tooling  | pnpm Workspace, TypeScript 6, ESLint (Type-Aware), Prettier, GitHub Actions |
| Hosting  | Netlify (Frontend), Railway (Backend), Cloudinary (Images)                  |

First time trying TanStack Query, Zod, Vitest, Supertest, pnpm Workspace, and Github Actions.

## Architecture

A pnpm workspace with three packages:

```
packages/
  api/      Express + Prisma REST API
  web/      React Single-Page App
  shared/   Request And Response Types
```

The API's return types are declared in the shared package and the web client's fetch functions use the same ones, so a change in response shape should break the typecheck on both sides.

```
routes → controllers → services → queries
                     ↳ serializers
```

- **Routes** — I tried to use Zod validation for the first time over express-validator.
- **Controllers** — I tried to keep this to HTTP concerns along the lines of reading a request, calling a service if necessary, and returning the response.
- **Services** — I tried to incorporate these in the structure for the first time to handle extra logic and keep controllers centered around handling HTTP concerns.
- **Queries** — All database calls
- **Serializers** — I tried to use these for the first time to turn the Prisma rows directly or after going through services into the shared package response types.

I tried a new structure where Prisma is injected rather than imported everywhere it's needed. createApp(prisma) builds the Express app and every layer below receives the Prisma Client it was handed. I believe this made testing easier because the tests could construct an application using a test database without needing other code changes.

### Coordinates

The math was pretty confusing for me but character hit boxes are stored as normalized xMin, xMax, yMin, and yMax values. Both axes are divided by image width so a square region stays square in the stored numbers. The web client converts back to CSS percentages, which are axis relative, by multiplying the y values by (width/height). This allowed the coordinates to remain accurate regardless of the size of the image.

### API

| Method  | Path                        |                                       |
| ------- | --------------------------- | ------------------------------------- |
| `GET`   | `/health`                   | Liveness check                        |
| `GET`   | `/scenes`                   | All scenes with character counts      |
| `GET`   | `/scenes/:slug`             | One scene with its character list     |
| `GET`   | `/scenes/:slug/leaderboard` | Top 20 times for a scene              |
| `POST`  | `/games`                    | Start a session, returns a session id |
| `GET`   | `/games/current`            | Current game state                    |
| `POST`  | `/guesses`                  | Submit a guess                        |
| `PATCH` | `/games/current/score`      | Submit a name and returns a rank      |

Session-scoped routes read an "X-Game-Session" header rather than a cookie.

## Running Locally

**Prerequisites:** Node 22+, pnpm 10+, PostgreSQL 16+.

```bash
git clone https://github.com/rlechuong/wheres-waldo.git
cd wheres-waldo
pnpm install
```

Create the two databases:

```bash
createdb wheres_waldo_dev
createdb wheres_waldo_test
```

Copy the example environment files and fill in your connection strings:

```bash
cp packages/api/.env.example packages/api/.env
cp packages/api/.env.test.example packages/api/.env.test
cp packages/web/.env.example packages/web/.env
```

| Variable                     | Package | Notes                                |
| ---------------------------- | ------- | ------------------------------------ |
| `DATABASE_URL`               | api     | PostgreSQL connection string         |
| `CORS_ORIGINS`               | api     | Comma-separated allowed origins      |
| `VITE_API_URL`               | web     | Example: http://localhost:3000       |
| `VITE_CLOUDINARY_CLOUD_NAME` | web     | Defaults to this project's own cloud |

Migrate and seed, then start both packages in separate terminals:

```bash
pnpm --filter @wheres-waldo/api migrate:deploy
pnpm --filter @wheres-waldo/api db:seed # Deletes all existing rows

pnpm --filter @wheres-waldo/api dev
pnpm --filter @wheres-waldo/web dev
```

## Testing

```bash
pnpm --filter @wheres-waldo/api test
```

37 integration tests run through Supertest against a real PostgreSQL test database. The database is cleared and the Prisma client connects to the test database before each test in src/test/setup.ts.

I also tried to use CI through Github Actions but my understanding of it is still quite poor.

## Known Issues

- Abandoned game sessions accumulate in the database. Ideally would have a way to clear them on schedule.
- Tied leaderboard times receive arbitrary distinct ranks rather than a shared rank.
- "Skip score submission" is remembered in local storage, so clearing site data brings dialog back.
- No frontend tests.
- Character selection and scaling of gameplay elements in general need improvement on mobile.

## Credits

Paintings by Pieter Bruegel the Elder: Netherlandish Proverbs, Children's Games, and The Fight Between Carnival and Lent. All three are in the public domain and were sourced from Wikimedia Commons.
