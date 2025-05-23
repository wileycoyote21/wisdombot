// /api/post-wisdom.js
import * as openaiUtils from "../utils/openai.js";

console.log('openaiUtils exports:', openaiUtils);

const handler = async (req, res) => {
  try {
    if (typeof openaiUtils.generateWisdom !== 'function') {
      throw new Error('generateWisdom function not found in openaiUtils exports');
    }
    const wisdom = await openaiUtils.generateWisdom();
    res.status(200).json({ wisdom });
  } catch (error) {
    console.error('Error generating wisdom:', error);
    res.status(500).json({ error: error.message });
  }
};

export default handler;

