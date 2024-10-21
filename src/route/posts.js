const axios = require("axios");
const redisClient = require("../lib/redis-client");
const { responseJSON, responseError } = require("../lib/util");

let RedisInit = false;
let RedisClient = null;

async function getPostById(request, response) {
  const postId = request.parsed.json.id;
  const cachedData = await queryCache(postId);

  if (cachedData) {
    responseJSON(response, cachedData);
    return;
  }

  const url = `https://jsonplaceholder.typicode.com/posts/${postId}`;
  
  axios.get(url).then(async (resp)=>{
    await storePostToCache(postId, resp.data);
    responseJSON(response, resp.data);
  }).catch((error)=>{
    console.log(error.response);
    responseError(response);
  });
}

async function queryCache(id){
  if(!RedisInit) {
    RedisClient = await redisClient.createRedisClient();
  }

  if(!RedisClient.isReady) {
    return null;
  }

  const key = `post-cache-${id}`; // key : post-cache-1;
  const data = await redisClient.getCachedData(key, true);
  return data;
}

async function storePostToCache(postId, data){
  console.log(postId);
  if(!RedisClient.isReady) {
    return false;
  }

  data.isCached = true;

  const key = `post-cache-${postId}`; // key : post-cache-1;
  const isSet = await redisClient.setCache(key, data);

  return isSet;
}

module.exports = {
  get: getPostById
}
