-- OWLY CaaS Backend: SQL Examples for Creator Verification & Gamification

-- ============================================================================
-- CREATOR VERIFICATION QUERIES
-- ============================================================================

-- Get all pending creator verifications
SELECT 
    c.id, 
    u.name, 
    u.email,
    c.category,
    c.total_followers,
    cv.status,
    cv.content_quality_score,
    cv.created_at
FROM creator_verifications cv
JOIN creators c ON cv.creator_id = c.id
JOIN users u ON c.user_id = u.id
WHERE cv.status = 'pending'
ORDER BY cv.created_at ASC;

-- Get verified creators with high quality scores
SELECT 
    c.id,
    u.name,
    c.category,
    c.total_followers,
    c.content_quality_score,
    c.is_verified,
    c.verified_at
FROM creators c
JOIN users u ON c.user_id = u.id
WHERE c.is_verified = TRUE AND c.content_quality_score >= 80
ORDER BY c.content_quality_score DESC;

-- Count creators by verification status
SELECT 
    verification_status,
    COUNT(*) as count
FROM creators
GROUP BY verification_status
ORDER BY count DESC;

-- Get creators with lowest followers in each category
SELECT DISTINCT ON (category)
    category,
    id,
    total_followers,
    is_verified
FROM creators
ORDER BY category, total_followers ASC;

-- Update verification status for a creator
UPDATE creator_verifications
SET 
    status = 'verified',
    content_quality_score = 85,
    verified_at = NOW(),
    updated_at = NOW()
WHERE creator_id = 1;

-- Reject a creator application
UPDATE creator_verifications
SET 
    status = 'rejected',
    rejection_reason = 'Insufficient portfolio quality',
    rejected_at = NOW(),
    updated_at = NOW()
WHERE creator_id = 2;

-- ============================================================================
-- BADGE QUERIES
-- ============================================================================

-- Get all badges awarded to a user
SELECT 
    badge_type,
    badge_name,
    rarity,
    awarded_at
FROM badges
WHERE user_id = 1
ORDER BY awarded_at DESC;

-- Count users with specific badge
SELECT COUNT(DISTINCT user_id) as user_count
FROM badges
WHERE badge_name = 'First Purchase';

-- Get users with most badges
SELECT 
    user_id,
    u.name,
    COUNT(*) as badge_count
FROM badges b
JOIN users u ON b.user_id = u.id
GROUP BY user_id, u.name
ORDER BY badge_count DESC
LIMIT 20;

-- Get badge distribution by rarity
SELECT 
    rarity,
    COUNT(*) as total_awarded
FROM badges
GROUP BY rarity
ORDER BY total_awarded DESC;

-- Award first_purchase badge to a user (check first)
INSERT INTO badges 
    (user_id, badge_type, badge_name, description, rarity, awarded_at, metadata)
SELECT 
    1,
    'milestone',
    'First Purchase',
    'Made your first purchase',
    'common',
    NOW(),
    '{}'::jsonb
WHERE NOT EXISTS (
    SELECT 1 FROM badges 
    WHERE user_id = 1 AND badge_name = 'First Purchase'
);

-- ============================================================================
-- STREAK QUERIES
-- ============================================================================

-- Get active streaks (users with ongoing streaks)
SELECT 
    s.user_id,
    u.name,
    s.streak_type,
    s.current_count,
    s.longest_count,
    s.last_action_date,
    CURRENT_DATE - s.last_action_date::date as days_since_last_action
FROM streaks s
JOIN users u ON s.user_id = u.id
ORDER BY s.current_count DESC;

-- Get broken streaks (users who missed a day)
SELECT 
    s.user_id,
    u.name,
    s.streak_type,
    s.current_count,
    s.longest_count,
    s.last_action_date
FROM streaks s
JOIN users u ON s.user_id = u.id
WHERE (CURRENT_DATE - s.last_action_date::date) > 1;

-- Get longest streaks by type
SELECT 
    streak_type,
    MAX(longest_count) as max_streak
FROM streaks
GROUP BY streak_type
ORDER BY max_streak DESC;

-- Get users with specific streak type
SELECT 
    user_id,
    u.name,
    current_count,
    longest_count
FROM streaks s
JOIN users u ON s.user_id = u.id
WHERE streak_type = 'daily_login'
ORDER BY current_count DESC;

-- Reset streak for user (if needed)
UPDATE streaks
SET 
    current_count = 0,
    updated_at = NOW()
WHERE user_id = 1 AND streak_type = 'daily_login';

-- ============================================================================
-- USER LEVEL QUERIES
-- ============================================================================

-- Get user level information
SELECT 
    user_id,
    u.name,
    level,
    experience_points,
    total_points,
    FLOOR(total_points / 1000) + 1 as calculated_level
FROM user_levels ul
JOIN users u ON ul.user_id = u.id
WHERE user_id = 1;

-- Get users close to next level
SELECT 
    user_id,
    u.name,
    level,
    experience_points,
    total_points,
    (1000 - (total_points % 1000)) as xp_to_next_level
FROM user_levels ul
JOIN users u ON ul.user_id = u.id
WHERE (1000 - (total_points % 1000)) < 100
ORDER BY xp_to_next_level ASC;

-- Get level distribution
SELECT 
    level,
    COUNT(*) as user_count
FROM user_levels
GROUP BY level
ORDER BY level DESC;

-- Get top level users
SELECT 
    user_id,
    u.name,
    level,
    total_points
FROM user_levels ul
JOIN users u ON ul.user_id = u.id
ORDER BY level DESC, total_points DESC
LIMIT 10;

-- Award experience points to user
UPDATE user_levels
SET 
    total_points = total_points + 500,
    level = FLOOR((total_points + 500) / 1000) + 1,
    experience_points = (total_points + 500) % 1000,
    updated_at = NOW()
WHERE user_id = 1;

-- ============================================================================
-- LEADERBOARD QUERIES
-- ============================================================================

-- Points leaderboard
SELECT 
    ROW_NUMBER() OVER (ORDER BY ul.total_points DESC) as rank,
    ul.user_id,
    u.name,
    ul.level,
    ul.total_points as points
FROM user_levels ul
JOIN users u ON ul.user_id = u.id
ORDER BY ul.total_points DESC
LIMIT 10;

-- Followers leaderboard
SELECT 
    ROW_NUMBER() OVER (ORDER BY c.total_followers DESC) as rank,
    c.user_id,
    u.name,
    c.total_followers as followers
FROM creators c
JOIN users u ON c.user_id = u.id
WHERE c.total_followers > 0
ORDER BY c.total_followers DESC
LIMIT 10;

-- Purchases leaderboard
SELECT 
    ROW_NUMBER() OVER (ORDER BY COUNT(o.id) DESC) as rank,
    o.user_id,
    u.name,
    COUNT(o.id) as total_purchases
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.status = 'delivered'
GROUP BY o.user_id, u.name
ORDER BY COUNT(o.id) DESC
LIMIT 10;

-- Referrals leaderboard
SELECT 
    ROW_NUMBER() OVER (ORDER BY COUNT(r.id) DESC) as rank,
    r.user_id,
    u.name,
    COUNT(r.id) as referrals
FROM rewards r
JOIN users u ON r.user_id = u.id
WHERE r.referred_by IS NOT NULL
GROUP BY r.user_id, u.name
ORDER BY COUNT(r.id) DESC
LIMIT 10;

-- Streaks leaderboard
SELECT 
    ROW_NUMBER() OVER (ORDER BY MAX(s.current_count) DESC) as rank,
    s.user_id,
    u.name,
    MAX(s.current_count) as current_streak,
    s.streak_type
FROM streaks s
JOIN users u ON s.user_id = u.id
GROUP BY s.user_id, u.name, s.streak_type
ORDER BY MAX(s.current_count) DESC
LIMIT 10;

-- ============================================================================
-- ANALYTICS & STATISTICS
-- ============================================================================

-- Summary statistics
SELECT 
    (SELECT COUNT(*) FROM creators) as total_creators,
    (SELECT COUNT(*) FROM creators WHERE is_verified = TRUE) as verified_creators,
    (SELECT COUNT(DISTINCT user_id) FROM badges) as users_with_badges,
    (SELECT COUNT(*) FROM badges) as total_badges_awarded,
    (SELECT COUNT(*) FROM user_levels) as users_with_levels,
    (SELECT AVG(level) FROM user_levels) as average_level;

-- Creator statistics by category
SELECT 
    category,
    COUNT(*) as total_creators,
    COALESCE(SUM(CASE WHEN is_verified = TRUE THEN 1 ELSE 0 END), 0) as verified_count,
    COALESCE(SUM(CASE WHEN is_verified = TRUE THEN 1 ELSE 0 END), 0) * 100.0 / COUNT(*) as verification_rate,
    AVG(total_followers) as avg_followers,
    AVG(content_quality_score) as avg_quality_score
FROM creators
GROUP BY category
ORDER BY total_creators DESC;

-- Badge statistics
SELECT 
    badge_type,
    badge_name,
    COUNT(*) as total_awarded,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM badges), 2) as percentage
FROM badges
GROUP BY badge_type, badge_name
ORDER BY total_awarded DESC;

-- User engagement metrics
SELECT 
    u.id,
    u.name,
    (SELECT COUNT(*) FROM badges WHERE user_id = u.id) as badge_count,
    (SELECT COALESCE(MAX(level), 1) FROM user_levels WHERE user_id = u.id) as level,
    (SELECT COUNT(*) FROM orders WHERE user_id = u.id AND status = 'delivered') as purchases,
    (SELECT COUNT(*) FROM posts WHERE user_id = u.id) as posts_created
FROM users u
ORDER BY badge_count DESC
LIMIT 20;

-- ============================================================================
-- DATA MAINTENANCE
-- ============================================================================

-- Clean up old streak records (example: older than 2 years)
DELETE FROM streaks
WHERE updated_at < NOW() - INTERVAL '2 years'
AND current_count = 0;

-- Reset all streaks to 0 (use with caution)
UPDATE streaks SET current_count = 0, updated_at = NOW();

-- Recalculate all user levels (use with caution)
UPDATE user_levels
SET 
    level = FLOOR(total_points / 1000) + 1,
    experience_points = total_points % 1000,
    updated_at = NOW();

-- Check data integrity: orphaned badge records
SELECT b.* FROM badges b
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = b.user_id);

-- Check data integrity: orphaned creator verifications
SELECT cv.* FROM creator_verifications cv
WHERE NOT EXISTS (SELECT 1 FROM creators c WHERE c.id = cv.creator_id);

-- ============================================================================
-- INDEX OPTIMIZATION QUERIES (For Performance)
-- ============================================================================

-- Create indexes for common queries
CREATE INDEX idx_creators_verification_status ON creators(verification_status);
CREATE INDEX idx_creators_user_id ON creators(user_id);
CREATE INDEX idx_badges_user_id ON badges(user_id);
CREATE INDEX idx_badges_awarded_at ON badges(awarded_at);
CREATE INDEX idx_streaks_user_streak ON streaks(user_id, streak_type);
CREATE INDEX idx_user_levels_total_points ON user_levels(total_points DESC);
CREATE INDEX idx_leaderboard_cache_type ON leaderboard_cache(leaderboard_type);
