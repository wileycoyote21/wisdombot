import postWisdom from './post-wisdom.js';
import postProphecy from './post-prophecy.js';
import postSnark from './post-snark.js';

const handlers = [postWisdom, postProphecy, postSnark];

export default async function handler(req, res) {
  const randomHandler = handlers[Math.floor(Math.random() * handlers.length)];
  return randomHandler(req, res);
}

