# MShipping Mobile

A premium mobile logistics management application built with Expo (React Native) and a high-performance Bun/Elysia backend.

## 🚀 Features

- **Modern Dashboard**: Real-time logistics analytics and shipment tracking.
- **Invoice Management**: Modernized card-based UI with professional A5 Landscape PDF export.
- **Secure Auth**: JWT-based authentication with Biometric login support (FaceID/Fingerprint).
- **Interactive Tracking**: Detailed shipment journey steps and real-time status updates.
- **Full API Docs**: Interactive Swagger documentation for all backend services.

## 🛠 Tech Stack

- **Frontend**: 
  - Expo SDK 54 (React Native)
  - Expo Router (File-based routing)
  - Custom UI Components (BlurView, LinearGradient, Lucide Icons)
  - Expo Print & Sharing (PDF Generation)
- **Backend**: 
  - [Bun](https://bun.sh) (Runtime)
  - ElysiaJS (Web Framework)
  - Drizzle ORM
  - **Microsoft SQL Server (MS-SQL)**
- **API Documentation**: OpenAPI 3.0 / Swagger

## 📂 Project Structure

```
shipping-mobile/
├── app/                # Expo Router screens (invoices, shipments, profile, etc.)
├── components/         # Shared UI components (Cards, Badges, Nav)
├── constants/          # Theme tokens, colors, and translations
├── services/           # Frontend API client (Axios)
└── backend/            # Backend Elysia service
    ├── drizzle/        # Auto-generated migrations
    └── src/
        ├── db/         # MS-SQL schema & database connection
        ├── routes/     # Modular route handlers (auth, invoices, etc.)
        └── index.ts    # Main entry point & Swagger setup
```

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (18+)
- [Bun](https://bun.sh) (Required for backend)
- **Microsoft SQL Server** running (Local or Cloud)
- [Expo Go](https://expo.dev/go) app on your mobile device

### 1. Backend Setup (Bun)

```bash
cd backend
bun install

# Configure .env with MS-SQL credentials (see list below)
# Seed the database
bun src/db/seed.ts

# Start the dev server
bun run dev
```
*Swagger UI available at:* `http://localhost:3000/swagger`

### 2. Frontend Setup (Expo)

```bash
# From root directory
npm install
npx expo start -c
```

## 🔐 Environment Variables (Backend)

Create a `.env` file in the `backend/` folder:

```env
DB_HOST=localhost
DB_USER=sa
DB_PASSWORD=your_strong_password
DB_NAME=mshipping_db
JWT_SECRET=MSHIPPING_SECRET_KEY_2024
SERVER_SIGNATURE=MSHIPPING_V2_SECURE
APP_PORT=3000
APP_BASE_URL=http://localhost:3000
```

---
*Built with ❤️ by MShipping Dev Team*
