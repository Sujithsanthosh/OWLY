# CaaS Platform Backend

Community-Commerce-as-a-Service (CaaS) Platform Backend - AI-powered social commerce platform combining ecommerce, communities, creator economy, and hyperlocal commerce for FOOD and FASHION.

## Features

### Phase 1: Core Infrastructure (Complete ✅)
- **Authentication System**
  - JWT token generation and refresh
  - Email/password login & signup
  - Phone OTP verification
  - Google OAuth integration
  - Password hashing with bcryptjs

- **User Management**
  - User profiles with roles (customer, seller, creator, admin, delivery)
  - Creator profiles with portfolio and verification
  - User interests and location tracking
  - Profile updates and password changes

- **API Standards**
  - Standardized response wrapper
  - Comprehensive error handling
  - Input validation
  - Rate limiting ready

### Phase 2: Core Commerce (In Progress)
- **Products & Fashion**
  - Fashion product CRUD
  - Product categorization
  - Inventory management
  - Multi-image support with Cloudinary
  - Search and filtering

- **Food Items**
  - Food item management
  - Vegetarian/dietary info
  - Nutritional information
  - Availability status
  - Restaurant/cloud kitchen support

- **Communities**
  - Create and join communities
  - Community types (food, fashion, local, creator, college)
  - Member roles (admin, moderator, member)
  - Community feed and announcements
  - Member management

- **Social Feed**
  - Post creation (text, images, videos)
  - Comment system with nested replies
  - Like/unlike functionality
  - View tracking for analytics
  - Feed personalization ready

- **Reviews & Ratings**
  - Product/food reviews
  - Star ratings (1-5)
  - Photo uploads in reviews
  - Review aggregation and stats
  - User review history

- **Orders & Payments**
  - Shopping cart and checkout
  - Order creation and management
  - Order status tracking (pending → confirmed → preparing → out_for_delivery → delivered)
  - Payment processing with Razorpay
  - Payment processing with Stripe
  - Order history and details

- **Rewards & Referrals**
  - Points system
  - Referral code generation and tracking
  - Cashback calculation
  - Point redemption
  - Leaderboard

### Phase 3: Advanced Features (Ready)
- **Livestream Commerce** (API endpoints prepared)
- **AI Integration** (OpenAI hooks in place)
- **Delivery Management** (Partner tracking)
- **Seller Dashboard** (Analytics endpoints)
- **Admin Dashboard** (Management endpoints)

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL with PostGIS
- **Real-time**: Socket.io
- **Authentication**: JWT
- **Password Security**: bcryptjs
- **Media**: Cloudinary
- **Payments**: Razorpay & Stripe
- **AI**: OpenAI API
- **Maps**: Google Maps API

## Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository>
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Initialize database**
```bash
# Connect to PostgreSQL and run the schema
psql -U postgres -d owly -f ../db/schema.sql
```

5. **Start development server**
```bash
npm run dev
```

Server will run on `http://localhost:5000`

## API Documentation

### Authentication Endpoints

#### Sign Up
```
POST /api/auth/signup
Body: {
  name: string,
  email: string,
  password: string (min 8 chars, uppercase, number),
  phone?: string,
  interests?: string[],
  location?: string
}
Response: { user, accessToken, refreshToken }
```

#### Login
```
POST /api/auth/login
Body: {
  email?: string,
  phone?: string,
  password: string
}
Response: { user, accessToken, refreshToken }
```

#### Get Profile
```
GET /api/auth/profile
Headers: { Authorization: "Bearer <token>" }
Response: { user details with all fields }
```

#### Update Profile
```
PUT /api/auth/profile
Headers: { Authorization: "Bearer <token>" }
Body: {
  name?: string,
  bio?: string,
  interests?: string[],
  avatar_url?: string
}
Response: { updated user }
```

### Products Endpoints

#### Get Products
```
GET /api/products/fashion?category=shoes&search=nike&page=1&limit=20
Response: { products, page, limit }
```

#### Create Product
```
POST /api/products/fashion
Headers: { Authorization: "Bearer <token>" }
Body: {
  name: string,
  description: string,
  price: number,
  category: string,
  images: string[],
  stock_quantity: number
}
Response: { product }
```

### Communities Endpoints

#### Get Communities
```
GET /api/communities?type=food&search=restaurant&page=1&limit=20
Response: { communities, page, limit }
```

#### Create Community
```
POST /api/communities
Headers: { Authorization: "Bearer <token>" }
Body: {
  name: string,
  description: string,
  type: string (food|fashion|local|creator),
  banner_url?: string,
  is_private?: boolean
}
Response: { community }
```

#### Join Community
```
POST /api/communities/:id/join
Headers: { Authorization: "Bearer <token>" }
Response: { message }
```

### Posts & Social Feed Endpoints

#### Create Post
```
POST /api/posts
Headers: { Authorization: "Bearer <token>" }
Body: {
  community_id?: number,
  content: string,
  media_urls?: string[],
  type?: string (standard|reel|poll|product_drop),
  product_id?: number
}
Response: { post }
```

#### Get Feed
```
GET /api/posts/feed?page=1&limit=20
Response: { posts, page, limit }
```

#### Like Post
```
POST /api/posts/:id/like
Headers: { Authorization: "Bearer <token>" }
Response: { message }
```

#### Create Comment
```
POST /api/posts/:post_id/comments
Headers: { Authorization: "Bearer <token>" }
Body: {
  content: string
}
Response: { comment }
```

#### Create Review
```
POST /api/posts/reviews
Headers: { Authorization: "Bearer <token>" }
Body: {
  product_id: number,
  product_type: string,
  rating: number (1-5),
  comment?: string,
  image_urls?: string[]
}
Response: { review }
```

### Orders Endpoints

#### Create Order
```
POST /api/orders
Headers: { Authorization: "Bearer <token>" }
Body: {
  items: [{ product_id, product_type, quantity, price }],
  total_amount: number,
  delivery_address: string,
  payment_method: string (razorpay|stripe)
}
Response: { order_id, payment_data }
```

#### Confirm Payment
```
POST /api/orders/confirm
Headers: { Authorization: "Bearer <token>" }
Body: {
  order_id: number,
  payment_id: string,
  razorpay_order_id?: string,
  signature?: string
}
Response: { message }
```

#### Get My Orders
```
GET /api/orders/me/orders?page=1&limit=20
Headers: { Authorization: "Bearer <token>" }
Response: { orders, page, limit }
```

### Rewards Endpoints

#### Get My Rewards
```
GET /api/rewards/me
Headers: { Authorization: "Bearer <token>" }
Response: { user_id, points, referral_code }
```

#### Get Referral Code
```
GET /api/rewards/referral/code
Headers: { Authorization: "Bearer <token>" }
Response: { referral_code, referral_url }
```

#### Apply Referral
```
POST /api/rewards/referral/apply
Headers: { Authorization: "Bearer <token>" }
Body: { referral_code: string }
Response: { message, points_referrer, points_you }
```

#### Redeem Points
```
POST /api/rewards/points/redeem
Headers: { Authorization: "Bearer <token>" }
Body: { points: number, type?: string }
Response: { points, redeemed, amount_credited }
```

#### Get Leaderboard
```
GET /api/rewards/leaderboard?type=points&limit=10
Response: { leaderboard }
```

## Real-time Features (Socket.io)

### Events

**Join Community Room**
```javascript
socket.emit('join-community', communityId);
```

**Leave Community Room**
```javascript
socket.emit('leave-community', communityId);
```

**Post Created** (broadcasted to community)
```javascript
socket.on('post-created', (post) => {...});
```

**Like Added** (broadcasted to post)
```javascript
socket.on('like-added', (like) => {...});
```

**Comment Added** (broadcasted to post)
```javascript
socket.on('comment-added', (comment) => {...});
```

## Database Schema

### Core Tables
- `users` - User accounts with profiles
- `creators` - Creator profiles
- `communities` - Community spaces
- `community_members` - Community memberships
- `products` - Fashion items
- `food_items` - Food products
- `posts` - Social posts
- `comments` - Post comments
- `reviews` - Product/food reviews
- `orders` - Orders
- `order_items` - Order line items
- `rewards` - User rewards and referrals
- `user_interactions` - Feed analytics
- `livestreams` - Livestream data

See `/db/schema.sql` for full details.

## Project Structure

```
backend/
├── src/
│   ├── index.ts           # Main entry point
│   ├── config/            # Configuration files
│   │   ├── db.ts
│   │   └── cloudinary.ts
│   ├── controllers/       # Business logic
│   │   ├── authController.ts
│   │   ├── productController.ts
│   │   ├── communityController.ts
│   │   ├── postController.ts
│   │   ├── commentController.ts
│   │   ├── reviewController.ts
│   │   ├── orderController.ts
│   │   ├── rewardController.ts
│   │   └── ...
│   ├── routes/            # API route handlers
│   ├── middleware/        # Express middleware
│   ├── services/          # External integrations
│   ├── utils/             # Utility functions
│   └── types/             # TypeScript types
├── db/
│   └── schema.sql         # Database schema
├── .env.example           # Environment template
├── package.json
└── tsconfig.json
```

## Scripts

```bash
# Development
npm run dev              # Start with ts-node

# Production
npm run build            # Compile TypeScript
npm run start            # Run compiled JavaScript

# Testing
npm test                 # Run tests (to be implemented)
```

## Response Format

All API responses follow a standard format:

```javascript
{
  success: boolean,
  message: string,
  data?: any,
  error?: string,
  timestamp: ISO8601_string
}
```

## Error Handling

- `400` - Bad Request / Validation Error
- `401` - Unauthorized (Missing/invalid token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Security Features

- ✅ JWT-based authentication
- ✅ Bcryptjs password hashing
- ✅ CORS configured
- ✅ Rate limiting ready
- ✅ Input validation
- ✅ Role-based access control
- ✅ Payment signature verification

## Next Steps

1. **Frontend** - Implement React Next.js UI
2. **Mobile App** - React Native mobile app
3. **Livestream** - Integrate video streaming
4. **AI** - Implement recommendation engine
5. **Deployment** - Docker & AWS setup
6. **Testing** - Jest & Supertest setup
7. **Monitoring** - Logging & analytics

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@owly.app or create an issue in the repository.
