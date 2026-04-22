# MShipping Mobile

A mobile logistics management application built with Expo (React Native) and a Bun/Elysia backend.

## Tech Stack

- **Frontend**: Expo SDK 54, React Native, Expo Router (file-based routing)
- **Backend**: Bun + Elysia, Drizzle ORM, MySQL
- **UI**: Custom components with BlurView, LinearGradient, Lucide icons

## Project Structure

```
app/          → Expo Router screens (dashboard, customers, shipments, invoices, settings)
components/   → Shared React Native components (BottomNav, ScreenContainer, etc.)
constants/    → Theme colors & translations
context/      → Language & Theme context providers
hooks/        → Custom hooks (useFetch, useThemeColors)
services/     → API client
backend/      → Bun/Elysia REST API server
```

## Getting Started

### Prerequisites

- Node.js 18+
- [Bun](https://bun.sh) (for backend)
- MySQL server running locally
- Expo Go app on your phone

### Frontend (Expo)

```bash
npm install
npx expo start
```

### Backend (Bun/Elysia)

```bash
cd backend
bun install
# Configure .env with your MySQL credentials
bun run dev
```

### Environment Variables (Backend)

```
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=mshipping_db
JWT_SECRET=your_secret_key
```
