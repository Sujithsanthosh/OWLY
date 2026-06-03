-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE,
    role VARCHAR(50) DEFAULT 'customer', -- customer, seller, creator, admin, delivery
    avatar_url TEXT,
    bio TEXT,
    interests JSONB DEFAULT '[]',
    delivery_coords GEOMETRY(Point, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Creators Table (Profiles for specialized creators)
CREATE TABLE creators (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    category VARCHAR(100), -- food, fashion, lifestyle
    portfolio_urls TEXT[],
    total_followers INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_status VARCHAR(50) DEFAULT 'unverified', -- unverified, pending, verified, rejected
    content_quality_score INTEGER DEFAULT 0,
    achievements JSONB DEFAULT '[]',
    stats JSONB DEFAULT '{}', -- engagement rate, follower growth, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Communities Table
CREATE TABLE communities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- food, fashion, local, creator, etc.
    creator_id INTEGER REFERENCES users(id),
    banner_url TEXT,
    is_private BOOLEAN DEFAULT FALSE,
    members_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Community Memberships
CREATE TABLE community_members (
    community_id INTEGER REFERENCES communities(id),
    user_id INTEGER REFERENCES users(id),
    role VARCHAR(50) DEFAULT 'member', -- member, moderator, admin
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (community_id, user_id)
);

-- Products Table (Fashion & General)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    images TEXT[],
    stock_quantity INTEGER DEFAULT 0,
    community_id INTEGER REFERENCES communities(id),
    metadata JSONB, -- size, color, brands, AI tags
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Food Items Table
CREATE TABLE food_items (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    is_vegetarian BOOLEAN,
    nutritional_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Posts Table (Social Feed)
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    community_id INTEGER REFERENCES communities(id),
    content TEXT,
    media_urls TEXT[],
    type VARCHAR(50) DEFAULT 'standard', -- standard, reel, poll, product_drop
    product_id INTEGER, -- Optional link to product/food_item
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    metadata JSONB, -- AI suggestions, tags, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comments Table
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reviews Table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    product_id INTEGER, -- Can be product or food_item
    product_type VARCHAR(50),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    image_urls TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Interactions (for AI Feed)
CREATE TABLE user_interactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    post_id INTEGER REFERENCES posts(id),
    interaction_type VARCHAR(50), -- view, like, comment, share, click
    weight INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    delivery_partner_id INTEGER REFERENCES users(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, preparing, out_for_delivery, delivered, cancelled
    payment_status VARCHAR(50) DEFAULT 'unpaid',
    payment_method VARCHAR(50),
    delivery_address TEXT,
    delivery_coords GEOMETRY(Point, 4326),
    razorpay_order_id VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255),
    payment_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order Items
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER,
    product_type VARCHAR(50),
    quantity INTEGER NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL
);

-- Livestreams Table
CREATE TABLE livestreams (
    id SERIAL PRIMARY KEY,
    host_id INTEGER REFERENCES users(id),
    community_id INTEGER REFERENCES communities(id),
    title VARCHAR(255),
    status VARCHAR(50) DEFAULT 'upcoming', -- upcoming, live, ended
    thumbnail_url TEXT,
    viewer_count INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE
);

-- Rewards & Referrals
CREATE TABLE rewards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    points INTEGER DEFAULT 0,
    referral_code VARCHAR(50) UNIQUE,
    referred_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Analytics Table (Simplified)
CREATE TABLE platform_analytics (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Creator Verification Applications
CREATE TABLE creator_verifications (
    id SERIAL PRIMARY KEY,
    creator_id INTEGER REFERENCES creators(id) UNIQUE,
    user_id INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending', -- pending, verified, rejected
    follower_count INTEGER DEFAULT 0,
    content_quality_score INTEGER DEFAULT 0, -- 0-100
    rejection_reason TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Badges & Achievements
CREATE TABLE badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    badge_type VARCHAR(50) NOT NULL, -- milestone, social, seller, content_creator
    badge_name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT,
    rarity VARCHAR(50) DEFAULT 'common', -- common, rare, epic, legendary
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB -- Additional data
);

-- Streaks Tracking
CREATE TABLE streaks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    streak_type VARCHAR(50) NOT NULL, -- daily_login, daily_purchase, daily_referral
    current_count INTEGER DEFAULT 0,
    longest_count INTEGER DEFAULT 0,
    last_action_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, streak_type)
);

-- User Levels & Experience
CREATE TABLE user_levels (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    level INTEGER DEFAULT 1,
    experience_points INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Leaderboards (cached)
CREATE TABLE leaderboard_cache (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    leaderboard_type VARCHAR(50) NOT NULL, -- points, followers, purchases, referrals, streaks
    rank INTEGER,
    value INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, leaderboard_type)
);
