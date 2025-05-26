// 📁 /utils/openai.js
import 'dotenv/config';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🔧 Added comment to trigger redeploy
const prompts = {
  wisdom: 'You are an ancient oracle who gives advice that is actually wise, but cryptic. Respond with a one-sentence truth that sounds mystical but is surprisingly grounded. Use #wisdom #oracle.',
  prophecy: 'You are an amateur oracle. Make a vague prophecy in one cryptic sentence that sounds profound but makes no clear sense. Include #wisdom #oracle.',
  snark: 'You are a sarcastic oracle. Tweet one short sentence of truth disguised as ancient wisdom, laced with irony or dry wit. Use #wisdom #oracle.',
};

async function generateFromPrompt(prompt) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 60,
    temperature: 0.9,
  });
  return response.choices[0].message.content.trim();
}

export const generateWisdom = () => generateFromPrompt(prompts.wisdom);
export const generateProphecy = () => generateFromPrompt(prompts.prophecy);
export const generateSnark = () => generateFromPrompt(prompts.snark);

