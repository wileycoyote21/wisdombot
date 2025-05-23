import postProphecy from './post-prophecy.js';
import postWisdom from './post-wisdom.js';
import postSnark from './post-snark.js';

const handlers = [postProphecy, postWisdom, postSnark];

export default async function postRandom(req, res) {
  const handler = handlers[Math.floor(Math.random() * handlers.length)];
  return handler(req, res);
}

