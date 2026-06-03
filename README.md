# 🚀 OWLY - Community Commerce as a Service (CaaS) Platform

A production-ready AI-powered social commerce platform that combines ecommerce, communities, creator economy, and hyperlocal commerce for **FOOD** and **FASHION**.

Think of it as: **Shopify + Instagram + Discord + Swiggy + TikTok Shop = OWLY**

## ✨ Features

### 🛍️ Commerce
- Fashion products with variants (size, color, brand)
- Food items with nutritional info
- Smart inventory management
- Multi-payment support (Razorpay, Stripe)
- Order tracking from pending to delivery

### 👥 Communities
- Create and join communities (food, fashion, local, creator-led)
- Community feeds and discussions
- Member roles and permissions
- Announcements and events
- Live commerce events

### 📱 Social Features
- Infinite scroll social feed (TikTok style)
- Post creation with media (images, videos)
- Comments and replies
- Like/unlike functionality
- Product reviews with ratings
- User stories

### 🎬 Creator Economy
- Creator profiles with verification
- Portfolio management
- Follower tracking
- Affiliate commissions
- Creator leaderboards
- Monetization hooks

### 💰 Rewards & Loyalty
- Points-based rewards system
- Referral program with unique codes
- Cashback on purchases
- Leaderboard rankings
- Point redemption

### 🚚 Logistics
- Hyperlocal delivery
- Real-time order tracking
- Delivery partner app
- Route optimization
- Earnings management

### 🤖 AI Integration
- Personalized feed algorithm
- Food recommendations
- Fashion styling assistant
- Content moderation
- Customer support chatbot
- Analytics and insights

### 📊 Dashboards
- Seller analytics dashboard
- Creator earnings dashboard
- Admin management panel
- Delivery partner app

## 🏗️ Architecture

```
OWLY Platform
├── Frontend (Next.js)      - Web application
├── Mobile (React Native)   - iOS/Android app
├── Backend (Node.js)       - REST API + WebSockets
├── Database (PostgreSQL)   - Primary data store
└── Services
    ├── Payment (Razorpay, Stripe)
    ├── Media (Cloudinary)
    ├── AI (OpenAI)
    ├── Maps (Google Maps)
    └── Real-time (Socket.io)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- Docker (optional)

### Setup

#### Option 1: Docker (Recommended)
```bash
# Create .env file
cp backend/.env.example backend/.env
# Update with your credentials

# Start all services
docker-compose up -d

# Backend: http://localhost:5000
# Frontend: http://localhost:3000
```

#### Option 2: Local Setup

**Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your config
npm run dev
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

**Database**
```bash
# With Docker
docker run -d \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=owly \
  -p 5432:5432 \
  postgis/postgis:16-3.4-alpine

# Then run schema
psql -U postgres -h localhost -d owly -f backend/db/schema.sql
```

## 📖 Documentation

### Backend
- [Backend README](./backend/README.md) - API endpoints, setup, architecture
- [Database Schema](./backend/db/schema.sql) - Complete database structure
- [Controllers](./backend/src/controllers) - Business logic

### Frontend
- [Next.js App](./frontend) - React components and pages
- [Custom Hooks](./frontend/src/hooks) - API integration
- [Global State](./frontend/src/store) - App context

### Mobile
- [React Native App](./mobile) - Expo-based mobile app

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/refresh-token
GET    /api/auth/profile
PUT    /api/auth/profile
```

### Products
```
GET    /api/products/fashion
POST   /api/products/fashion
PUT    /api/products/fashion/:id
DELETE /api/products/fashion/:id
```

### Communities
```
GET    /api/communities
POST   /api/communities
POST   /api/communities/:id/join
GET    /api/communities/:id/members
```

### Social Feed
```
GET    /api/posts/feed
POST   /api/posts
POST   /api/posts/:id/like
POST   /api/posts/:id/comments
```

### Orders
```
POST   /api/orders
POST   /api/orders/confirm
GET    /api/orders/me/orders
```

### Rewards
```
GET    /api/rewards/me
POST   /api/rewards/referral/apply
GET    /api/rewards/leaderboard
```

[See full API docs in Backend README](./backend/README.md)

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Language**: TypeScript
- **Database**: PostgreSQL with PostGIS
- **Real-time**: Socket.io
- **Auth**: JWT
- **Media**: Cloudinary
- **Payments**: Razorpay, Stripe
- **AI**: OpenAI API

### Frontend
- **Framework**: Next.js 16 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **HTTP**: Axios
- **Real-time**: Socket.io Client

### Mobile
- **Framework**: Expo / React Native
- **Navigation**: Expo Router
- **UI**: Native Components
- **HTTP**: Axios
- **Real-time**: Socket.io Client

### Infrastructure
- **Database**: PostgreSQL 12+
- **Containerization**: Docker
- **Orchestration**: Docker Compose

## 📁 Project Structure

```
owly/
├── backend/
│   ├── src/
│   │   ├── controllers/         # Business logic
│   │   ├── routes/              # API endpoints
│   │   ├── middleware/          # Auth, validation
│   │   ├── services/            # External integrations
│   │   ├── utils/               # Utilities
│   │   ├── config/              # Configuration
│   │   └── index.ts             # Entry point
│   ├── db/
│   │   └── schema.sql           # Database schema
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── app/                 # Pages (routing)
│   │   ├── components/          # React components
│   │   ├── hooks/               # Custom hooks
│   │   ├── store/               # Global state
│   │   ├── lib/                 # Utilities
│   │   └── styles/              # CSS
│   ├── public/                  # Static assets
│   ├── package.json
│   └── next.config.ts
│
├── mobile/
│   ├── app/                     # App screens
│   ├── components/              # React Native components
│   ├── app.json
│   └── package.json
│
├── docker-compose.yml
├── .env.example
└── README.md (this file)
```

## 🔐 Environment Variables

Copy and configure the `.env` file:

```bash
# Backend only
cp backend/.env.example backend/.env
```

Required variables:
```
PORT=5000
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
STRIPE_SECRET_KEY=your_secret_key
OPENAI_API_KEY=your_openai_key
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 📊 Project Status

### ✅ Completed (Phase 1 & 2)
- Database schema with 15+ tables
- Authentication system (JWT, OTP, OAuth ready)
- Product CRUD (fashion & food)
- Community system
- Social feed (posts, comments, likes)
- Reviews and ratings
- Orders and payments (API ready)
- Rewards and referrals
- API documentation
- Frontend hooks and context
- Login UI

### 🚧 In Progress
- Payment gateway integration
- Livestream commerce
- AI features
- Admin dashboard
- Seller dashboard
- Delivery system

### 📋 Planned
- Mobile app screens
- Advanced analytics
- Creator marketplace
- Subscription system
- Video support
- AR features
- Advanced search

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## 📜 License

MIT License - feel free to use this project

## 🆘 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Email: support@owly.app
- Docs: See README files in each directory

## 🎯 Roadmap

- **Week 1-2**: Payment integration & testing
- **Week 3-4**: Livestream commerce
- **Week 5-6**: AI features
- **Week 7-8**: Mobile app
- **Week 9-10**: Performance & optimization
- **Week 11-12**: Security audit & deployment

## 🌟 Key Features That Make OWLY Unique

1. **Social-First Commerce** - Shopping through community and creators, not just products
2. **Hyperlocal** - Geographic targeting for food and nearby fashion
3. **Creator-Led** - Empowering creators to monetize their communities
4. **AI-Native** - Personalization at every step
5. **Real-time** - Live events, chats, and notifications
6. **Addictive UX** - TikTok-like infinite feed and interactions

## 💡 Business Model

- **Transaction Commissions** - Percentage on each sale
- **Promoted Listings** - Sellers can boost visibility
- **Creator Monetization** - Platform cut of affiliate commissions
- **Subscription Plans** - Premium community features
- **Membership Programs** - Customer loyalty programs
- **Advertising** - Targeted ads to users

---

**Made with ❤️ for community commerce**

Last Updated: 2024  
Platform: Community Commerce as a Service (CaaS)
