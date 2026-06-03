# Creator Verification & Gamification API Documentation

## Overview
This document describes the new features implemented for the OWLY CaaS backend:
1. Creator Verification System
2. Gamification System

## Database Tables Added

### 1. Creator Verification
- **creators** (updated)
  - Added: `verification_status`, `content_quality_score`, `achievements`, `stats`, `updated_at`
  - Tracks creator profiles with verification status

- **creator_verifications**
  - Stores verification applications and status
  - Tracks quality scores and rejection reasons

### 2. Gamification
- **badges** - Award badges to users (milestone, social, seller, content_creator)
- **streaks** - Daily login, purchase, and referral streak tracking
- **user_levels** - User experience points and levels
- **leaderboard_cache** - Cached leaderboard rankings

## API Endpoints

### Creator Verification System

#### 1. Apply for Creator Verification
```
POST /api/creators/apply
Content-Type: application/json
Authorization: Bearer <token>

Body:
{
  "category": "fashion|food|lifestyle",
  "portfolio_urls": ["https://example.com/portfolio"]
}

Response (201):
{
  "success": true,
  "data": {
    "message": "Verification application submitted successfully",
    "creator_id": 1,
    "status": "pending"
  }
}
```

#### 2. Get Creator Profile
```
GET /api/creators/:id

Response (200):
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "avatar_url": "https://...",
    "bio": "...",
    "category": "fashion",
    "portfolio_urls": ["https://..."],
    "total_followers": 5000,
    "is_verified": true,
    "verification_status": "verified",
    "content_quality_score": 85,
    "verified_at": "2024-01-15T10:00:00Z",
    "rejection_reason": null,
    "achievements": ["first_post", "prolific_creator"],
    "stats": {
      "engagement_rate": 0.08,
      "follower_growth": 150
    }
  }
}
```

#### 3. List Creators with Filters
```
GET /api/creators?category=fashion&verification_status=verified&page=1&limit=20&sort_by=total_followers&order=DESC

Response (200):
{
  "success": true,
  "data": {
    "creators": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

#### 4. Admin Verify Creator
```
PUT /api/creators/:id/verify
Content-Type: application/json
Authorization: Bearer <admin_token>

Body:
{
  "approve": true,
  "content_quality_score": 90,
  "rejection_reason": null
}

Response (200):
{
  "success": true,
  "data": {
    "message": "Creator verified successfully",
    "creator_id": 1,
    "status": "verified"
  }
}
```

#### 5. Update Creator Profile
```
PUT /api/creators/:id
Content-Type: application/json
Authorization: Bearer <token>

Body:
{
  "category": "fashion",
  "portfolio_urls": ["https://..."],
  "total_followers": 6000,
  "achievements": ["first_post", "prolific_creator"],
  "stats": { "engagement_rate": 0.1 }
}

Response (200):
{
  "success": true,
  "data": {
    "message": "Creator profile updated successfully",
    "creator_id": 1
  }
}
```

### Gamification System

#### 1. Award Badge to User (Admin/Internal)
```
POST /api/gamification/badges/award
Content-Type: application/json
Authorization: Bearer <token>

Body:
{
  "user_id": 1,
  "badge_id": "first_purchase"
}

Response (201):
{
  "success": true,
  "data": {
    "message": "Badge awarded successfully",
    "badge": {
      "id": 1,
      "badge_type": "milestone",
      "badge_name": "First Purchase",
      "description": "Made your first purchase",
      "rarity": "common",
      "awarded_at": "2024-01-15T10:00:00Z"
    }
  }
}
```

Available Badge IDs:
- Milestone: `first_purchase`, `ten_purchases`, `hundred_purchases`
- Social: `first_like`, `hundred_followers`, `thousand_followers`
- Seller: `first_sale`, `ten_sales`
- Content Creator: `first_post`, `prolific_creator`

#### 2. Get Available Badges
```
GET /api/gamification/badges/available

Response (200):
{
  "success": true,
  "data": {
    "total_badges": 10,
    "badges": [
      {
        "id": "first_purchase",
        "type": "milestone",
        "name": "First Purchase",
        "description": "Made your first purchase",
        "rarity": "common"
      },
      ...
    ]
  }
}
```

#### 3. Get User Badges
```
GET /api/gamification/badges/:user_id

Response (200):
{
  "success": true,
  "data": {
    "user_id": 1,
    "total_badges": 5,
    "badges": [
      {
        "id": 1,
        "badge_type": "milestone",
        "badge_name": "First Purchase",
        "description": "Made your first purchase",
        "icon_url": "https://...",
        "rarity": "common",
        "awarded_at": "2024-01-15T10:00:00Z"
      },
      ...
    ]
  }
}
```

#### 4. Check/Update Streak
```
POST /api/gamification/streaks/check
Content-Type: application/json
Authorization: Bearer <token>

Body:
{
  "streak_type": "daily_login|daily_purchase|daily_referral"
}

Response (200):
{
  "success": true,
  "data": {
    "user_id": 1,
    "streak_type": "daily_login",
    "id": 1,
    "current_count": 5,
    "longest_count": 10,
    "last_action_date": "2024-01-15"
  }
}
```

#### 5. Get User Level
```
GET /api/gamification/levels/:user_id

Response (200):
{
  "success": true,
  "data": {
    "user_id": 1,
    "id": 1,
    "level": 5,
    "experience_points": 250,
    "total_points": 4250,
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
}
```

#### 6. Update User Level (Award XP)
```
POST /api/gamification/levels/update
Content-Type: application/json
Authorization: Bearer <token>

Body:
{
  "user_id": 1,
  "experience_points": 500
}

Response (200):
{
  "success": true,
  "data": {
    "user_id": 1,
    "id": 1,
    "level": 6,
    "experience_points": 250,
    "total_points": 4750,
    "updated_at": "2024-01-15T10:00:00Z",
    "level_up": true,
    "previous_level": 5,
    "new_level": 6
  }
}
```

#### 7. Get Leaderboards
```
GET /api/gamification/leaderboards?type=points&limit=10

Query Parameters:
- type: points|followers|purchases|referrals|streaks (default: points)
- limit: 1-100 (default: 10)

Response (200):
{
  "success": true,
  "data": {
    "type": "points",
    "leaderboard": [
      {
        "rank": 1,
        "user_id": 42,
        "name": "Top Creator",
        "avatar_url": "https://...",
        "value": 15000,
        "level": 15
      },
      {
        "rank": 2,
        "user_id": 31,
        "name": "Active User",
        "avatar_url": "https://...",
        "value": 12500
      },
      ...
    ]
  }
}
```

## Authentication

All endpoints that require authentication use JWT Bearer tokens:
```
Authorization: Bearer <JWT_TOKEN>
```

Admin-only endpoints require the user's role to be 'admin'.

## Level System

- **1000 XP = 1 Level**
- Experience points reset per level
- Total points accumulate forever
- Formula: `level = floor(total_points / 1000) + 1`

## Streak System

Streaks track consecutive days of activities:
- **daily_login**: Check in every day
- **daily_purchase**: Make a purchase every day
- **daily_referral**: Refer a new user every day

If a user misses a day:
- Streak resets to 0
- If they return the next day, streak starts at 1 again

Longest streak is recorded for achievements.

## Badge Rarity Levels

- **Common**: Easy to obtain (e.g., First Purchase)
- **Rare**: Moderate effort (e.g., 10 Purchases)
- **Epic**: Significant achievement (e.g., 100 Purchases, 1K Followers)
- **Legendary**: Exceptional achievement (reserved for future features)

## Error Responses

All endpoints return standard error format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error info",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

Common status codes:
- 400: Bad Request / Validation Error
- 401: Unauthorized
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error
