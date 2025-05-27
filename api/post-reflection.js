import { readMemory, writeMemory } from '../utils/memory.js';
import { postTweet } from '../utils/twitter.js';
import { generateReflection } from '../utils/openai.js';

const run = async () => {
  const reflectionText = await generateReflection();
  const tweet = await postTweet(reflectionText);

  // Log the post to memory
  const memory = readMemory();
  const today = new Date().toISOString().split('T')[0];

  let todayEntry = memory.history.find(entry => entry.date === today);
  if (!todayEntry) {
    todayEntry = { date: today };
    memory.history.push(todayEntry);
  }

  todayEntry.reflection = {
    text: reflectionText,
    tweetId: tweet.id,
    tone: ['introspective', 'self-aware', 'curious']
  };

  writeMemory(memory);
};

run();

