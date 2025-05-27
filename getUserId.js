// getUserId.js
import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';
dotenv.config();

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

async function getBotUserId() {
  try {
    const user = await client.currentUser();
    console.log('Your Twitter bot user ID is:', user.id);
  } catch (err) {
    console.error('Error fetching user ID:', err);
  }
}

getBotUserId();
