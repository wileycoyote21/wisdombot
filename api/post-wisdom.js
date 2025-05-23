// 📁 /api/post-wisdom.js
import * as openaiUtils from "../utils/openai.js";
console.log('openaiUtils keys:', Object.keys(openaiUtils));

import { generateWisdom } from "../utils/openai.js";
import { postToX } from "../utils/twitter.js";

export default async function handler(req, res) {
  try {
    const tweet = await generateWisdom();
    await postToX(tweet);
    res.status(200).json({ status: "posted", tweet });
  } catch (err) {
    console.error("Error posting wisdom:", err);
    res.status(500).json({ error: "Failed to post wisdom." });
  }
}
