# Expedition Management System Backend

This is a comprehensive expedition management platform built with Node.js, Express, MongoDB, Socket.IO for the backend, and Next.js with Tailwind CSS for the frontend.

## Features

- User Authentication with Magic Links
- Role-based Access Control
- Expedition Management (CRUD operations)
- Real-time Updates with Socket.IO
- Analytics (Popular Destinations and Monthly Bookings)

## Prerequisites

- Node.js (v14 or later)
- MongoDB
- npm or yarn or pnpm

## Installation

1. Clone the repository:
2. Copy .env.example and rename .env with replace correct value like:

```bash

# API PREFIX
API_PREFIX='/app/api/v1'

# PORT NUMBER
PORT=5333

# MONGO URL
MONGO_URI=mongodb+srv://db_name:Password@cluster0.xnn0u.mongodb.net

# JWT
JWT_SECRET=fjhhIOHfjkflsjagju0fujljldfglse
JWT_EXPIRE=7d

# SMTP
SMPT_SERVICE=yahoo
SMPT_HOST=smtp.mail.yahoo.com
SMPT_PORT=465
SMPT_MAIL=your_email@yahoo.com
SMPT_PASSWORD=your_app_password

# Frontend URL
FRONTEND_URL=https://localhost:3333

```

3. Run

```bash
 npm install
 or
 yarn
 or
 pnpm install
```

3. Finally

```bash
 npm run dev
```
