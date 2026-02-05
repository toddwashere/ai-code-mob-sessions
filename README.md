# CoolProject

A Next.js application with TypeScript, Prisma ORM, Tailwind CSS, Shadcn UI, and Jest. Local development uses PostgreSQL in a Docker container. Features the Expense Shamer — track expenses with maximum shame.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI
- **Testing:** Jest with React Testing Library

## Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **Docker** and **Docker Compose** (for local PostgreSQL)
- **npm** or **pnpm** (package manager)

## Quick Start

1. **Clone and install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and ensure:
   - `DATABASE_URL` points to your PostgreSQL instance (see Docker section below)

3. **Start PostgreSQL (Docker):**

   ```bash
   npm run docker:up
   ```

4. **Run database migrations:**

   ```bash
   npm run db:migrate:dev
   ```

5. **Start the development server:**

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Development Commands

### Docker (PostgreSQL)

| Command                        | Description                                  |
| ------------------------------ | -------------------------------------------- |
| `npm run docker:up`            | Start PostgreSQL container in the background |
| `npm run docker:down`          | Stop and remove the PostgreSQL container     |
| `docker compose ps`            | Check if the PostgreSQL container is running |
| `docker compose logs postgres` | View PostgreSQL container logs               |

**Manual Docker commands:**

- Start: `docker compose up -d`
- Stop: `docker compose down`
- View logs: `docker compose logs -f postgres`

**Connection details** (from `docker-compose.yml`):

- Host: `localhost`
- Port: `6767`
- User: `coolproject`
- Password: `coolproject`
- Database: `coolproject`
- Connection string: `postgresql://coolproject:coolproject@localhost:6767/coolproject`

---

### Database (Prisma)

| Command                  | Description                                                             |
| ------------------------ | ----------------------------------------------------------------------- |
| `npm run db:generate`    | Generate Prisma Client (runs automatically on `npm install`)            |
| `npm run db:push`        | Push schema changes to DB without creating migrations (dev prototyping) |
| `npm run db:migrate`     | Apply pending migrations (production)                                   |
| `npm run db:migrate:dev` | Create a new migration and apply it (development)                       |
| `npm run db:studio`      | Open Prisma Studio (visual DB editor)                                   |
| `npm run db:seed`        | Run the seed script                                                     |

**Creating a migration:**

```bash
npm run db:migrate:dev -- --name add_user_table
```

**Resetting the database** (drops all data):

```bash
npx prisma migrate reset
```

**Viewing your data:**

```bash
npm run db:studio
```

Opens Prisma Studio at `http://localhost:5555`.

---

### Application

| Command                 | Description                      |
| ----------------------- | -------------------------------- |
| `npm run dev`           | Start Next.js development server |
| `npm run build`         | Build for production             |
| `npm run start`         | Run production server            |
| `npm run lint`          | Run ESLint                       |
| `npm run test`          | Run Jest tests                   |
| `npm run test:watch`    | Run Jest in watch mode           |
| `npm run test:coverage` | Run Jest with coverage report    |

---

## Environment Variables

| Variable       | Description                                                                        |
| -------------- | ---------------------------------------------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string (e.g. `postgresql://user:pass@localhost:5432/dbname`) |
| `AUTH_SECRET`  | Secret for Auth.js (generate with `openssl rand -base64 32`)                       |

---

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/expenses/       # Expense API routes
│   ├── expenses/           # Expense Shamer page
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/
│   ├── expenses/           # Expense Shamer components
│   └── ui/                 # Shadcn UI components
├── lib/
│   ├── prisma.ts           # Prisma client
│   ├── shame.ts            # Shame utilities
│   └── utils.ts            # Utilities
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── migrations/         # Migration files
│   └── seed.ts             # Seed script
├── __tests__/              # Jest tests
├── docker-compose.yml      # PostgreSQL container
└── .env.example            # Example environment variables
```

---

## Useful Tips

- **First time setup:** Run `docker:up` before `db:migrate:dev` so the database exists.
- **Port 6767 in use:** Change the port in `docker-compose.yml` (e.g. `"6768:5432"`) and update `DATABASE_URL`.
- **Prisma Client errors:** Run `npm run db:generate` after schema changes.
- **Adding Shadcn components:** `npx shadcn@latest add <component-name>`
