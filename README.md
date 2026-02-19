# RecruitMe

A recruitment platform built with Next.js.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Database:** PostgreSQL with Prisma ORM
- **Package Manager:** pnpm

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Set up environment variables:

```bash
cp .env.example .env
```

Update `.env` with your database connection string:

```
DATABASE_URL="postgresql://user:password@localhost:5432/recruitme"
```

3. Run database migrations:

```bash
pnpm prisma migrate dev
```

4. Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |

## Adding UI Components

This project uses shadcn/ui. To add components:

```bash
pnpm dlx shadcn@latest add <component-name>
```

Example:

```bash
pnpm dlx shadcn@latest add button card input
```

## Project Structure

```
src/
├── app/          # Next.js App Router pages
├── components/   # React components
│   └── ui/       # shadcn/ui components
├── lib/          # Utility functions
└── hooks/        # Custom React hooks
prisma/
└── schema.prisma # Database schema
```
