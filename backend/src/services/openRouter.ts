import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  // OpenRouter requires these headers for ranking and tracking
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
    "X-Title": "NetCanvas AI",
  }
});

/**
 * Helper to call OpenRouter models.
 * Defaults to a fast/cheap model like Claude 3.5 Haiku, but can be scaled up.
 */
export const generateWithAI = async (messages: any[], model = "anthropic/claude-3-haiku") => {
  const response = await openai.chat.completions.create({
    model,
    messages,
  });
  return response.choices[0].message.content;
};