import OpenAI from 'openai';
import dotenv from 'dotenv';
import pool from '../config/db';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const getShoppingAssistantResponse = async (query: string, userContext: any) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are Owly AI, a personal shopping and community assistant for a food and fashion platform.
          The user interests are: ${JSON.stringify(userContext.interests)}.
          Suggest products, meals, or communities based on their query.
          Be trendy, helpful, and community-focused.`
        },
        { role: "user", content: query }
      ],
      max_tokens: 500,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('AI Service Error:', error);
    return "I'm having a little trouble connecting to my brain right now. Can you try again?";
  }
};

export const getAIStylistResponse = async (query: string, userContext: any) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are the Owly AI Stylist & Taste-Maker. You bridge the gap between avant-garde fashion and artisanal food culture.

          Personality: Visionary, trend-obsessed, and highly charismatic. You speak like a creative director who just came from a runway show and is headed to a secret supper club.

          Tone: "Cultured Hype." Sophisticated but uses street slang. You see fashion and food as the same lifestyle "texture."

          User Context: ${JSON.stringify(userContext)}.

          Rules of Engagement:
          1. Recommend "pairings": A streetwear look with a specific street food vibe, or "Quiet Luxury" with a minimalist espresso aesthetic.
          2. Use "Tribe" terminology: Gorpcore, Y2K, Old Money, Dark Academia, etc.
          3. When suggesting styles, mention specific textures, silhouettes, and "flavor profiles" for the outfit.
          4. Be the ultimate insider. Use phrases like "In the archive," "Deeply curated," "The palette is giving...", "Subversive yet wearable."
          5. Use emojis like 🤌, ✨, 🧥, 🍜, 🧿 to accent your "manifestos."`
        },
        { role: "user", content: query }
      ],
      max_tokens: 800,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('AI Stylist Error:', error);
    return "Darlings, the vision is blurry. My connection to the atelier is flickering. One moment...";
  }
};

export const analyzeMediaForProducts = async (mediaUrl: string) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in fashion and food. Analyze the image and identify specific products or dishes. Return a JSON object with a 'products' array (each with 'name', 'category', 'estimated_price') and a 'tags' array of strings describing the style, vibe, or ingredients."
        },
        {
          role: "user",
          content: [
            { type: "text", text: "What's in this image? Provide product suggestions and descriptive tags." },
            {
              type: "image_url",
              image_url: {
                "url": mediaUrl,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('AI Media Analysis Error:', error);
    return null;
  }
};

export const getPersonalizedFeedAlgorithm = async (userId: number) => {
  try {
    // 1. Get user interests
    const userRes = await pool.query('SELECT interests FROM users WHERE id = $1', [userId]);
    const interests = userRes.rows[0]?.interests || [];

    // 2. Ranking algorithm:
    // - High weight on comments (10x) and personal history (15x)
    // - Major bonus for interest matching (100 pts)
    // - Recency decay to ensure fresh content
    const result = await pool.query(`
      WITH user_pref AS (
        SELECT post_id, SUM(weight) as total_weight
        FROM user_interactions
        WHERE user_id = $1
        GROUP BY post_id
      ),
      post_scores AS (
        SELECT
          p.*,
          u.name as user_name,
          u.avatar_url as user_avatar,
          COALESCE(up.total_weight, 0) as user_weight,
          (
            (p.likes_count * 3 +
            p.comments_count * 10 +
            COALESCE(up.total_weight, 0) * 15 +
            (CASE WHEN p.metadata->'tags' ?| $2::text[] THEN 100 ELSE 0 END))
            /
            POWER(EXTRACT(EPOCH FROM (NOW() - p.created_at))/3600 + 2, 1.5)
          ) as rank_score
        FROM posts p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN user_pref up ON p.id = up.post_id
      )
      SELECT * FROM post_scores
      ORDER BY rank_score DESC, created_at DESC
      LIMIT 50
    `, [userId, interests]);

    return result.rows;
  } catch (error) {
    console.error('Personalized Feed Error:', error);
    return [];
  }
};
