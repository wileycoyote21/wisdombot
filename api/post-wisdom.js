import { generateWisdom } from '../utils/openai.js';
import { postToX } from '../utils/twitter.js';

function stripQuotes(text) {
  if (
    (text.startsWith('"') && text.endsWith('"')) ||
    (text.startsWith("'") && text.endsWith("'"))
  ) {
    return text.slice(1, -1);
  }
  return text;
}

export default async function handler(req, res) {
  try {
    const contentRaw = await generateWisdom();
    const content = stripQuotes(contentRaw);
    const tweet = await postToX(content);
    res.status(200).json({ success: true, tweet });
  } catch (error) {
    console.error('Error in /post-wisdom:', error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}




