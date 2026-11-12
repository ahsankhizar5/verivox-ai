# VeriVox SaaS Platform

A modern, full-stack deepfake audio detection platform built with Next.js, MongoDB, and AWS S3.

## Features

- 🎨 Modern, responsive UI with consistent design system
- 🔐 Role-based authentication (Free, Premium, Enterprise, Admin, Super Admin)
- 📊 Real-time audio analysis and visualization
- 💳 Stripe subscription management
- 🔑 Enterprise API access with rate limiting
- 📈 Usage analytics and reporting
- 🎯 Plan-based feature restrictions
- 📱 Fully responsive design

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Database**: MongoDB with Mongoose
- **Storage**: AWS S3 for audio files
- **Authentication**: JWT-based auth
- **Payment**: Stripe
- **Charts**: Chart.js, Recharts
- **Audio**: WaveSurfer.js

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB instance
- AWS S3 bucket
- Stripe account

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd verivox-platform
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` with your actual credentials.

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # User dashboard pages
│   ├── (admin)/           # Admin panel pages
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── layout/           # Layout components
│   └── features/         # Feature-specific components
├── lib/                  # Utilities and configurations
│   ├── db/              # Database models and connections
│   ├── auth/            # Authentication utilities
│   ├── s3/              # AWS S3 utilities
│   └── stripe/          # Stripe utilities
├── types/               # TypeScript type definitions
└── styles/              # Global styles
```

## Design System

The platform uses a comprehensive design system with:

- **Color Palette**: Primary (blue), Secondary (gray), Success, Danger, Warning
- **Typography**: Inter font family with 9 size variants
- **Spacing**: Consistent spacing scale
- **Components**: Reusable UI components (Button, Card, Input, etc.)
- **Shadows**: Soft, Medium, and Strong variants
- **Animations**: Fade-in, Slide-up, Slide-down

## User Roles

1. **Free User**: Limited uploads (5/day), basic features
2. **Premium User**: Unlimited uploads, PDF reports
3. **Enterprise User**: API access, bulk processing
4. **Admin**: User management, monitoring
5. **Super Admin**: Full system control

## API Documentation

See `/api-docs` for complete API documentation.

## Deployment

### Vercel (Recommended for Frontend)

```bash
vercel deploy
```

### Environment Variables

Make sure to set all environment variables in your deployment platform.

## License

Proprietary - All rights reserved

## Support

For support, email support@verivox.com
