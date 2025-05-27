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
      wisdom_posts: [],
      reflection_posts: [],
      replies: [],
      reply_tracker: { count_since_last_self_reply: 0 },
      last_mention_id: null,
    };
  }
}

async function saveMemory(memory) {
  await fs.writeFile(MEMORY_PATH, JSON.stringify(memory, null, 2));
}

// Create prompt for personal prophecy based on mention text
function createProphecyPrompt(userHandle, mentionText) {
  return `You are an insightful AI oracle who provides a personal, mysterious yet hopeful prophecy based on the user's mention:

User: @${userHandle} said "${mentionText}"

Write a single tweet (max 280 chars) that offers a thoughtful prophecy, encouraging and reflective.`;
}

async function generateProphecy(userHandle, mentionText) {
  const prompt = createProphecyPrompt(userHandle, mentionText);

  const completion = await openai.createChatCompletion({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 80,
    temperature: 0.85,
  });

  return completion.data.choices[0].message.content.trim();
}

async function replyToMentions() {
  const memory = await loadMemory();
  const sinceId = memory.last_mention_id;

  // Fetch mentions newer than sinceId (null fetches latest batch)
  const mentions = await twitter.getMentions(sinceId);

  if (!mentions || mentions.length === 0) {
    console.log('No new mentions found.');
    return;
  }

  // Process mentions in chronological order (oldest first)
  const sortedMentions = mentions.sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );

  for (const mention of sortedMentions) {
    try {
      // Skip if the mention is from the bot itself
      if (mention.author_id === twitter.botUserId) {
        continue;
      }

      const userHandle = mention.author_username || mention.username || 'user';
      const mentionText = mention.text.replace(/@\w+/g, '').trim(); // remove mentions

      const prophecyTweet = await generateProphecy(userHandle, mentionText);

      // Post reply referencing the mention
      await twitter.postTweet(prophecyTweet, mention.id);

      // Log the reply in memory
      memory.replies.push({
        id: (memory.replies.length + 1).toString(),
        content: prophecyTweet,
        in_reply_to_tweet_id: mention.id,
        created_at: new Date().toISOString(),
      });

      console.log(`Replied to mention ${mention.id} with prophecy.`);
    } catch (err) {
      console.error('Error replying to mention:', mention.id, err);
    }
  }

  // Update last_mention_id with the highest ID seen
  const maxId = sortedMentions.reduce(
    (max, mention) => (BigInt(mention.id) > BigInt(max) ? mention.id : max),
    sortedMentions[0].id
  );

  memory.last_mention_id = maxId;

  await saveMemory(memory);
  console.log(`Updated last_mention_id to ${maxId}`);
}

// Run if executed directly
if (require.main === module) {
  replyToMentions().catch(console.error);
}

export { replyToMentions };

