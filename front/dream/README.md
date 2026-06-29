# NannyConnect

A full-stack mobile platform for finding trusted nannies — similar to Uber, but for childcare. Parents can search, filter, hire, and chat with nannies. Nannies can manage profiles, accept requests, and communicate in real time.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Mobile | React Native (Expo), TypeScript, React Navigation, Redux Toolkit, React Query, React Hook Form, React Native Paper |
| Backend | Node.js, Express.js, MongoDB, Mongoose |
| Real-time | Socket.io |
| Auth | JWT + Refresh Tokens, Bcrypt, Email OTP |
| Storage | Cloudinary |
| Maps | Google Maps API |
| Notifications | Firebase Cloud Messaging |
| Payments | Stripe (future-ready) |
| Admin | React + Vite |

## Project Structure

```
dream/
├── backend/          # Express API + Socket.io
│   └── src/
│       ├── config/
│       ├── models/
│       ├── controllers/
│       ├── routes/
│       ├── middleware/
│       ├── services/
│       ├── socket/
│       └── utils/
├── mobile/           # React Native (Expo) app
│   └── src/
│       ├── components/
│       ├── screens/
│       ├── navigation/
│       ├── store/
│       ├── services/
│       ├── hooks/
│       └── theme/
├── admin/            # Admin dashboard
└── README.md
```

## Features

### Parent
- Register, login, email verification, forgot password
- Search nannies with advanced filters (location, price, skills, verification)
- Filter by **hourly**, **daily**, or **monthly** pricing
- View nanny profiles, save favorites, hire nannies
- Real-time chat with typing indicators
- Manage hiring requests and leave reviews

### Nanny
- Full profile with documents (ID, police verification, certificates, resume)
- **Hourly, daily, or monthly** pricing models
- Availability calendar, skills, languages
- Accept/reject hiring requests
- Real-time chat and online status

### Admin
- Dashboard analytics (users, hires, revenue)
- Approve/reject nanny profiles
- Verify documents, ban users
- Manage reports and reviews

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB 6+
- Expo CLI (`npm install -g expo-cli`)
- Cloudinary account (for image uploads)
- SMTP credentials (for OTP emails)

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secrets, Cloudinary, SMTP, etc.
npm install
npm run seed    # Creates admin user
npm run dev     # Starts on http://localhost:5000
```

Default admin credentials (after seed):
- Email: `admin@nannyconnect.com`
- Password: `Admin@123456`

### 2. Mobile App Setup

```bash
cd mobile
npm install
# Update apiUrl in app.json for your machine IP (not localhost on physical device)
npx expo start
```

For Android emulator, use `http://10.0.2.2:5000/api`.
For iOS simulator, use `http://localhost:5000/api`.
For physical devices, use your machine's local IP.

### 3. Admin Panel Setup

```bash
cd admin
cp .env.example .env
npm install
npm run dev     # Starts on http://localhost:5173
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register parent or nanny |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/verify-email` | Verify email OTP |
| POST | `/api/auth/forgot-password` | Send reset OTP |
| POST | `/api/auth/reset-password` | Reset password |
| POST | `/api/auth/refresh-token` | Refresh JWT |

### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search` | Search nannies with filters |
| GET | `/api/search/:id` | Get nanny profile |
| GET | `/api/search/recommendations` | AI recommendations |

### Hiring
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/hiring` | Create hiring request |
| PATCH | `/api/hiring/:id/respond` | Accept/reject |
| PATCH | `/api/hiring/:id/confirm` | Confirm hire |
| PATCH | `/api/hiring/:id/complete` | Complete job |

### Search Filter Parameters

```
?q=keyword&city=Mumbai&pricingType=hourly|daily|monthly
&minPrice=100&maxPrice=500&rating=4&experience=3
&verifiedOnly=true&liveIn=true&cpr=true&infantCare=true
&lat=19.07&lng=72.87&distance=50000
```

## Pricing Models

Nannies can set one of three pricing types:

| Type | Field | Example |
|------|-------|---------|
| Hourly | `hourlyRate` | ₹300/hr |
| Daily | `dailyRate` | ₹2,000/day |
| Monthly | `monthlySalary` | ₹25,000/month |

Parents can filter search results by pricing type and price range.

## Hiring Flow

```
Parent clicks Hire → Request sent → Nanny notified
→ Accept/Reject → Chat enabled → Schedule interview
→ Hire confirmed → Complete job → Leave review
```

## Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join:chat` | Client → Server | Join chat room |
| `message:send` | Client → Server | Send message |
| `message:new` | Server → Client | New message received |
| `typing:start/stop` | Both | Typing indicators |
| `message:read` | Both | Read receipts |
| `user:online` | Server → Client | Online status |

## Security

- JWT authentication with refresh tokens
- Role-based access control (parent, nanny, admin)
- Password hashing with bcrypt (12 rounds)
- Rate limiting (100 req/15 min)
- Helmet security headers
- MongoDB input sanitization
- File type validation on uploads
- Express validator on all inputs

## Deployment Guide

### Backend (Railway / Render / AWS)

1. Set all environment variables from `.env.example`
2. Use MongoDB Atlas for production database
3. Set `NODE_ENV=production`
4. Run `npm start`

### Mobile (EAS Build)

```bash
cd mobile
npx eas build --platform android
npx eas build --platform ios
npx eas submit
```

Update `app.json` extra.apiUrl to your production API URL.

### Admin (Vercel / Netlify)

```bash
cd admin
npm run build
# Deploy dist/ folder
```

Set `VITE_API_URL` to production API.

## Environment Variables

See `backend/.env.example`, `admin/.env.example`, and `mobile/app.json` extra config.

## License

MIT
