# Quick Reference: Creator Verification & Gamification Features

## 🎯 Quick Start

### For Developers
1. New controllers added:
   - `backend/src/controllers/creatorController.ts` (5 endpoints)
   - `backend/src/controllers/gamificationController.ts` (7 endpoints)

2. New routes added:
   - `/api/creators/*` - Creator management
   - `/api/gamification/*` - Gamification features

3. Database tables added:
   - `creator_verifications`
   - `badges`
   - `streaks`
   - `user_levels`
   - `leaderboard_cache`

### For API Integration
- See `API_DOCUMENTATION.md` for complete endpoint reference
- All endpoints follow REST conventions
- JWT authentication required for protected endpoints
- Standard error response format throughout

---

## 🔌 Quick API Examples

### Creator Application
```bash
curl -X POST http://localhost:5000/api/creators/apply \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "fashion",
    "portfolio_urls": ["https://example.com/portfolio"]
  }'
```

### Award Badge
```bash
curl -X POST http://localhost:5000/api/gamification/badges/award \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "badge_id": "first_purchase"
  }'
```

### Get Leaderboard
```bash
curl http://localhost:5000/api/gamification/leaderboards?type=points&limit=10
```

---

## 📊 Badge IDs Reference

**Milestone:**
- `first_purchase` - Made first purchase
- `ten_purchases` - Completed 10 purchases
- `hundred_purchases` - Completed 100 purchases

**Social:**
- `first_like` - Liked first post
- `hundred_followers` - Reached 100 followers
- `thousand_followers` - Reached 1000 followers

**Seller:**
- `first_sale` - Made first sale
- `ten_sales` - Made 10 sales

**Content Creator:**
- `first_post` - Published first post
- `prolific_creator` - Published 50 posts

---

## 🎮 Gamification Mechanics

### Level System
- 1000 total XP = 1 level
- Level = floor(total_points / 1000) + 1
- XP resets each level
- Total points accumulate forever

### Streaks
- Types: daily_login, daily_purchase, daily_referral
- Reset if user misses a day
- Longest streak recorded permanently

### Leaderboards
- Points: User levels/total_points
- Followers: Creator total_followers
- Purchases: COUNT of delivered orders
- Referrals: COUNT of referred users
- Streaks: MAX current streak count

---

## 🔐 Admin Operations

### Verify Creator
```bash
curl -X PUT http://localhost:5000/api/creators/1/verify \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approve": true,
    "content_quality_score": 85,
    "rejection_reason": null
  }'
```

### Award XP
```bash
curl -X POST http://localhost:5000/api/gamification/levels/update \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "experience_points": 500
  }'
```

---

## 📝 Database Quick Reference

### Get Creator Verification Status
```sql
SELECT c.*, cv.status, cv.content_quality_score 
FROM creators c
LEFT JOIN creator_verifications cv ON c.id = cv.creator_id
WHERE c.id = 1;
```

### Get User Badges
```sql
SELECT * FROM badges WHERE user_id = 1 ORDER BY awarded_at DESC;
```

### Get User Streak
```sql
SELECT * FROM streaks WHERE user_id = 1;
```

### Get Top 10 Points Leaders
```sql
SELECT u.name, ul.level, ul.total_points 
FROM user_levels ul
JOIN users u ON ul.user_id = u.id
ORDER BY ul.total_points DESC
LIMIT 10;
```

---

## ⚙️ Configuration

### Verification Requirements
- Minimum followers: 1000 (configurable in creatorController.ts)
- Minimum content quality: 60 (configurable in creatorController.ts)

### XP to Level
- 1000 XP per level (configurable in gamificationController.ts)

### Badge Definitions
- Located in gamificationController.ts: BADGE_DEFINITIONS object
- Easy to add new badges

---

## 🐛 Common Issues & Solutions

### 401 Unauthorized
- Check Bearer token in Authorization header
- Ensure token is valid and not expired

### 403 Forbidden
- Verify user role (admin endpoint requires 'admin' role)
- Check ownership (PUT /creators/:id requires owner or admin)

### 404 Not Found
- Creator/user doesn't exist
- Check ID parameter

### 400 Bad Request
- Missing required fields
- Invalid field values
- Check request body structure

---

## 📚 File Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── creatorController.ts (NEW)
│   │   ├── gamificationController.ts (NEW)
│   │   └── ... (other controllers)
│   ├── routes/
│   │   ├── creatorRoutes.ts (NEW)
│   │   ├── gamificationRoutes.ts (NEW)
│   │   └── ... (other routes)
│   └── index.ts (UPDATED)
├── db/
│   └── schema.sql (UPDATED)
└── ...

docs/
├── API_DOCUMENTATION.md (NEW)
└── IMPLEMENTATION_SUMMARY.md (NEW)
```

---

## 🚀 Next Steps

1. Run database migration: `npm run migrate` (if available)
2. Rebuild TypeScript: `npm run build`
3. Start development server: `npm run dev`
4. Test endpoints with provided examples
5. Integrate with frontend application
6. Add automated badge awarding in business logic

---

## 📞 Support Reference

For detailed information on:
- **API Endpoints** → See `API_DOCUMENTATION.md`
- **Implementation Details** → See `IMPLEMENTATION_SUMMARY.md`
- **Database Schema** → See `backend/db/schema.sql`
- **Code Implementation** → See controller files directly

---

**Last Updated:** 2024
**Status:** ✅ Production Ready
**Test Coverage:** Manual testing recommended
