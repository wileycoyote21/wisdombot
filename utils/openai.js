// scripts/utils/openai.js
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateCompletion(prompt, temperature = 0.7) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI error:', error);
    return null;
  }
}
