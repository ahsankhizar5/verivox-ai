# VeriVox Platform - Complete Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** and npm installed
- **MongoDB** instance (local or MongoDB Atlas)
- **AWS Account** with S3 bucket configured
- **Stripe Account** for payment processing

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd verivox-platform
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/verivox
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/verivox

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# AWS S3
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=verivox-audio-files

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# API
NEXT_PUBLIC_API_URL=http://localhost:3000
INFERENCE_SERVICE_URL=https://your-ml-service.com/api

# Environment
NODE_ENV=development
```

### 3. AWS S3 Setup

1. **Create S3 Bucket:**
   - Go to AWS Console → S3
   - Create a new bucket (e.g., `verivox-audio-files`)
   - Enable versioning (recommended)
   - Configure CORS:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://your-domain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

2. **Create IAM User:**
   - Go to IAM → Users → Add User
   - Select "Programmatic access"
   - Attach policy: `AmazonS3FullAccess` (or create custom policy)
   - Save Access Key ID and Secret Access Key

3. **Bucket Policy (Optional):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::verivox-audio-files/*"
    }
  ]
}
```

### 4. MongoDB Setup

#### Option A: Local MongoDB

```bash
# Install MongoDB locally (macOS)
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Use connection string
MONGODB_URI=mongodb://localhost:27017/verivox
```

#### Option B: MongoDB Atlas (Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user
4. Whitelist IP address (0.0.0.0/0 for development)
5. Get connection string
6. Update `.env` with connection string

### 5. Stripe Setup

1. **Create Stripe Account:**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - Get API keys from Developers → API Keys

2. **Create Products:**
   - Products → Add Product
   - Create "Premium" ($49/month)
   - Create "Enterprise" ($299/month)
   - Save Price IDs

3. **Webhook Setup:**
   - Developers → Webhooks
   - Add endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`
   - Save webhook secret

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
verivox-platform/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages group
│   │   ├── dashboard/         # User dashboard
│   │   ├── admin/             # Admin panel
│   │   ├── super-admin/       # Super admin panel
│   │   ├── api/               # API routes
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── layout/           # Layout components
│   │   └── features/         # Feature components
│   ├── lib/                  # Utilities
│   │   ├── db/              # Database
│   │   ├── auth/            # Authentication
│   │   ├── s3/              # AWS S3
│   │   └── middleware/      # Middleware
│   ├── types/               # TypeScript types
│   ├── utils/               # Helper functions
│   └── styles/              # Global styles
├── public/                  # Static files
├── .env.example            # Environment template
├── next.config.js          # Next.js config
├── tailwind.config.ts      # Tailwind config
├── tsconfig.json           # TypeScript config
└── package.json            # Dependencies
```

## 🎨 Design System

The platform uses a consistent design system with:

### Colors
- **Primary**: Blue (#0ea5e9)
- **Secondary**: Gray
- **Success**: Green
- **Danger**: Red
- **Warning**: Orange

### Components
All components are in `src/components/ui/`:
- Button
- Card
- Input
- Badge
- Alert
- ProgressBar
- Spinner
- Tabs
- Select

### Usage Example
```tsx
import { Button, Card, Badge } from '@/components/ui';

<Card variant="elevated" padding="lg">
  <h3>Title</h3>
  <Badge variant="success">Active</Badge>
  <Button variant="primary" size="md">Click Me</Button>
</Card>
```

## 🔐 Authentication

### User Roles
1. **Free** - Limited features
2. **Premium** - Unlimited uploads, PDF reports
3. **Enterprise** - API access, bulk processing
4. **Admin** - User management
5. **Super Admin** - Full system control

### Protected Routes
```tsx
// In API routes
import { withAuth, withRole } from '@/lib/middleware/auth';

export const GET = withAuth(async (request, payload) => {
  // Your logic here
});

export const POST = withRole(['admin', 'super_admin'])(async (request, payload) => {
  // Admin only logic
});
```

## 📊 Database Schema

### Collections

1. **users** - User accounts
2. **detections** - Audio analysis results
3. **apikeys** - Enterprise API keys
4. **subscriptions** - Stripe subscriptions

See `src/lib/db/models/` for full schemas.

## 🔌 API Routes

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Upload & Results
- `POST /api/upload` - Upload audio file
- `GET /api/results` - List detections
- `GET /api/results/:id` - Get detection details
- `DELETE /api/results/:id` - Delete detection

### Enterprise API
- `POST /api/detect` - Analyze audio (API key required)
- `GET /api/usage` - Get API usage stats

### Admin
- `GET /api/admin/users` - List users
- `POST /api/admin/suspend-user` - Suspend user account

## 🚢 Deployment

### Vercel (Frontend)

1. **Connect Repository:**
   ```bash
   vercel
   ```

2. **Set Environment Variables:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add all variables from `.env`

3. **Deploy:**
   ```bash
   vercel --prod
   ```

### Backend Considerations

- Use MongoDB Atlas for production database
- Use AWS S3 for file storage
- Enable CORS for your domain
- Set up proper backup strategy

### Production Checklist

- [ ] Update `JWT_SECRET` with strong random value
- [ ] Configure production MongoDB URI
- [ ] Set up AWS S3 bucket with proper permissions
- [ ] Configure Stripe production keys
- [ ] Enable HTTPS (Vercel does this automatically)
- [ ] Set up monitoring (e.g., Sentry)
- [ ] Configure backup strategy
- [ ] Test all payment flows
- [ ] Review security settings
- [ ] Set up CDN for static assets

## 🧪 Testing

### Create Test User

```bash
# Use signup page or API
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Test Upload

1. Login to get token
2. Upload audio file via UI or API
3. Check results page

## 🔧 Troubleshooting

### MongoDB Connection Issues
```bash
# Check MongoDB is running
mongosh

# Or for Atlas, verify:
# - Whitelist IP address
# - Correct connection string
# - Database user credentials
```

### S3 Upload Errors
- Verify AWS credentials
- Check bucket name and region
- Ensure IAM user has S3 permissions
- Check CORS configuration

### Build Errors
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [AWS S3 Guide](https://docs.aws.amazon.com/s3/)
- [Stripe Documentation](https://stripe.com/docs)

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the requirements.md document
3. Contact the development team

## 📝 Next Steps

1. ✅ Complete environment setup
2. ✅ Run development server
3. ⬜ Customize branding and colors
4. ⬜ Integrate actual ML inference service
5. ⬜ Set up Stripe products and webhooks
6. ⬜ Test all user flows
7. ⬜ Deploy to production

---

**Ready to launch!** 🚀
