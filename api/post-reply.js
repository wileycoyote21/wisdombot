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
    };
  }
}

async function saveMemory(memory) {
  await fs.writeFile(MEMORY_PATH, JSON.stringify(memory, null, 2));
}

// Compose prompt to create reply to a previous tweet
function createReplyPrompt(originalTweet) {
  return `You are an AI oracle reflecting thoughtfully on your own tweet:
  
"${originalTweet}"

Write a single, sincere, and engaging reply tweet (max 280 chars) that adds perspective or an opinion about the original.`;
}

async function generateReply(tweetContent) {
  const prompt = createReplyPrompt(tweetContent);

  const completion = await openai.createChatCompletion({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 70,
    temperature: 0.85,
  });

  return completion.data.choices[0].message.content.trim();
}

async function postReply() {
  const memory = await loadMemory();

  const totalPosts = memory.wisdom_posts.length + memory.reflection_posts.length;

  // Only reply if 8-12 posts since last reply
  if (
    memory.reply_tracker.count_since_last_self_reply < 8 ||
    memory.reply_tracker.count_since_last_self_reply > 12
  ) {
    console.log('Not time to post reply yet.');
    return;
  }

  // Gather last 12 posts (wisdom + reflection), sorted by date desc
  const combinedPosts = [...memory.wisdom_posts, ...memory.reflection_posts]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 12);

  // Pick a random post from recent 12
  const randomPost = combinedPosts[Math.floor(Math.random() * combinedPosts.length)];

  // Generate reply
  const replyTweet = await generateReply(randomPost.content);

  // Post reply, as a reply to original tweet
  const postedReply = await twitter.postTweet(replyTweet, randomPost.tweet_id);

  // Log reply and reset counter
  memory.replies.push({
    id: (memory.replies.length + 1).toString(),
    content: replyTweet,
    in_reply_to_tweet_id: randomPost.tweet_id,
    created_at: new Date().toISOString(),
  });

  memory.reply_tracker.count_since_last_self_reply = 0;

  await saveMemory(memory);
  console.log('Posted reply tweet:', replyTweet);
}

// Increment counter before exit, called from daily runner
async function incrementReplyCounter() {
  const memory = await loadMemory();
  memory.reply_tracker.count_since_last_self_reply++;
  await saveMemory(memory);
}

export { postReply, incrementReplyCounter };

// If running standalone
if (require.main === module) {
  postReply().catch(console.error);
}
