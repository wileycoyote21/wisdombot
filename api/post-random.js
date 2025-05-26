import { generateWisdom, generateSnark, generateProphecy } from '../utils/openai.js';
import { postToX } from '../utils/twitter.js';

export default async function handler(req, res) {
  try {
    const generators = [generateWisdom, generateSnark, generateProphecy];
    const randomGenerator = generators[Math.floor(Math.random() * generators.length)];
    const content = await randomGenerator();
    const tweet = await postToX(content);
    res.status(200).json({ success: true, tweet });
  } catch (error) {
    console.error('Error in /post-random:', error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}


