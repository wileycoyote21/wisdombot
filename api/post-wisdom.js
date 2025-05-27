import { readMemory, writeMemory } from '../utils/memory.js';
import { postTweet } from '../utils/twitter.js';
import { generateWisdom } from '../utils/openai.js';

const run = async () => {
  const wisdomText = await generateWisdom();
  const tweet = await postTweet(wisdomText);

  // Log the post to memory
  const memory = readMemory();
  const today = new Date().toISOString().split('T')[0];

  let todayEntry = memory.history.find(entry => entry.date === today);
  if (!todayEntry) {
    todayEntry = { date: today };
    memory.history.push(todayEntry);
  }

  todayEntry.wisdom = {
    text: wisdomText,
    tweetId: tweet.id,
    tone: ['prophetic', 'mysterious', 'relatable']
  };

  writeMemory(memory);
};

run();

