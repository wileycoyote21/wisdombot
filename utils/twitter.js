// 📁 /utils/twitter.js
import "dotenv/config";
import { TwitterApi } from "twitter-api-v2";

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const rwClient = twitterClient.readWrite;

export async function postToX(tweetText) {
  try {
    const response = await rwClient.v2.tweet(tweetText);
    console.log("Tweet posted:", response.data.id);
    return response.data;
  } catch (error) {
    console.error("Error posting tweet:", error);
    throw error;
  }
}
