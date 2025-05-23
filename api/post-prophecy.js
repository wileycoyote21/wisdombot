import { generateProphecy } from '../utils/openai.js';
import { postToTwitter } from '../utils/twitter.js';

export default async function handler(req, res) {
  try {
    const content = await generateProphecy();
    const tweet = await postToTwitter(content);
    res.status(200).json({ success: true, tweet });
  } catch (error) {
    console.error('Error in /post-prophecy:', error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}


