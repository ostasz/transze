# Ekovoltis Transze Portal

A secure B2B trading portal for electricity futures. All rights reserved Ekovoltis S.A.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: Auth.js (NextAuth) v5 + Prisma Adapter
- **UI**: Tailwind CSS + shadcn/ui

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL Database

### Installation

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Setup**:
    Create `.env` file:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/transze?schema=public"
    NEXTAUTH_SECRET="supersecretchangeit"
    NEXT_PUBLIC_APP_URL="http://localhost:3000"
    ```

3.  **Database Migration**:
    ```bash
    npx prisma migrate dev --name init
    ```

4.  **Seed Database**:
    ```bash
    npx prisma db seed
    ```

5.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## Features
- **Terminal**: Live quotes and market news.
- **Trading**: Buy/Sell futures contracts (BASE, PEAK, GAS).
- **Admin**: User management, Contract management, GDPR compliance.
- **Security**: RBAC, Audit Logs, Terms of Service enforcement.

## Project Structure
- `src/app`: App Router pages
- `src/components`: UI components (shadcn)
- `src/lib`: Utilities (auth, prisma)
- `prisma`: Database schema and seed

## License
Proprietary / Ekovoltis Internal Use Only.
