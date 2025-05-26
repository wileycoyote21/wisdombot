import { generateWisdom } from '../utils/openai.js';
import { postToX } from '../utils/twitter.js';

export default async function handler(req, res) {
  try {
    const content = await generateWisdom();
    const tweet = await postToX(content);
    res.status(200).json({ success: true, tweet });
  } catch (error) {
    console.error('Error in /post-wisdom:', error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}



