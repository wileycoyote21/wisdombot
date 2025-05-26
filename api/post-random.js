import { generateWisdom, generateProphecy, generateSnark } from '../utils/openai.js';
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

function getRandomGenerator() {
  const generators = [generateWisdom, generateProphecy, generateSnark];
  const randomIndex = Math.floor(Math.random() * generators.length);
  return generators[randomIndex];
}

export default async function handler(req, res) {
  try {
    const generate = getRandomGenerator();
    const contentRaw = await generate();
    const content = stripQuotes(contentRaw);
    const tweet = await postToX(content);
    res.status(200).json({ success: true, tweet });
  } catch (error) {
    console.error('Error in /post-random:', error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}



