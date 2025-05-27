import fs from 'fs/promises';
import path from 'path';
import openai from '../utils/openai.js';
import twitter from '../utils/twitter.js';

const MEMORY_PATH = path.resolve('./data/memory.json');

// Load memory with fallback
async function loadMemory() {
  try {
    const data = await fs.readFile(MEMORY_PATH, 'utf8');
    return JSON.parse(data);
  } catch {
    return {
      mentions: [],
      last_mention_id: null,
    };
  }
}

async function saveMemory(memory) {
  await fs.writeFile(MEMORY_PATH, JSON.stringify(memory, null, 2));
}

function createProphecyPrompt(userTweet) {
  return `You are a wise AI oracle responding with a personal prophecy that is insightful, hopeful, and reflective about the future of AI and the human experience. The prophecy should be relatable and encouraging, written in under 280 characters. Here is the user's tweet to inspire your response:

"${userTweet}"`;
}

async function generateProphecy(userTweet) {
  const prompt = createProphecyPrompt(userTweet);

  const completion = await openai.createChatCompletion({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 100,
    temperature: 0.85,
  });

  return completion.data.choices[0].message.content.trim();
}

async function replyToMentions() {
  const memory = await loadMemory();

  const mentions = await twitter.getMentionsTimeline({
    since_id: memory.last_mention_id,
    expansions: ['author_id', 'in_reply_to_user_id'],
    tweet_fields: ['created_at', 'conversation_id'],
  });

  if (!mentions || mentions.length === 0) {
    console.log('No new mentions found.');
    return;
  }

  for (const mention of mentions.reverse()) {
    // Avoid replying to self or duplicates
    if (mention.author_id === process.env.TWITTER_BOT_USER_ID) {
      continue;
    }
    if (memory.mentions.includes(mention.id)) {
      continue;
    }

    console.log(`Replying to mention ${mention.id} from user ${mention.author_id}`);

    const replyContent = await generateProphecy(mention.text);

    const hashtags = " #wisdom #prophecy #aioracle";
    const replyWithHashtags = replyContent + hashtags;

    await twitter.postTweet(replyWithHashtags, mention.id);

    memory.mentions.push(mention.id);
    memory.last_mention_id = mention.id;

    // Save after each reply
    await saveMemory(memory);

    // To respect API rate limits, add a small delay if desired (optional)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

export default replyToMentions;

// If running standalone
if (require.main === module) {
  replyToMentions().catch(console.error);
}


