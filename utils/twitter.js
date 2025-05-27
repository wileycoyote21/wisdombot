import { TwitterApi } from 'twitter-api-v2';

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

// Client with read & write access
const rwClient = twitterClient.readWrite;

// Your bot user ID, set after fetching
let botUserId = null;

async function initBotUserId() {
  if (!botUserId) {
    const user = await rwClient.v2.me();
    botUserId = user.data.id;
  }
  return botUserId;
}

// Post a tweet (optionally in reply to tweetId)
async function postTweet(text, replyToTweetId = null) {
  const params = replyToTweetId
    ? { text, reply: { in_reply_to_tweet_id: replyToTweetId } }
    : { text };
  const response = await rwClient.v2.tweet(params);
  return response.data;
}

// Fetch mentions since lastId (if provided)
async function getMentions(sinceId = null) {
  await initBotUserId();
  
  const params = {
    expansions: 'author_id',
    'user.fields': 'username',
    max_results: 50,
  };
  if (sinceId) {
    params.since_id = sinceId;
  }

  // Mentions timeline endpoint: GET /2/users/:id/mentions
  const mentionsResponse = await rwClient.v2.userMentionTimeline(botUserId, params);

  if (!mentionsResponse.data) return [];

  // Map user info by id for convenience
  const usersMap = {};
  if (mentionsResponse.includes && mentionsResponse.includes.users) {
    for (const user of mentionsResponse.includes.users) {
      usersMap[user.id] = user;
    }
  }

  // Construct mentions array with author info
  return mentionsResponse.data.map((mention) => ({
    id: mention.id,
    text: mention.text,
    created_at: mention.created_at,
    author_id: mention.author_id,
    author_username: usersMap[mention.author_id]?.username || null,
  }));
}

export default {
  postTweet,
  getMentions,
  botUserId,
};


