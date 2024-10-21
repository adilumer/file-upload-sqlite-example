const axios = require("axios");
const redisClient = require("../lib/redis-client");
const { responseJSON, responseError } = require("../lib/util");
const { sendEmail } = require("../lib/email-client");

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

async function mailPostTo(request, response) {
  const email = request.parsed.json.email;
  if(!email) {
    responseError(response, {status: 417, message: "EMAIL_INVALID"});
    return;
  }
  
  const postId = request.parsed.json.id;
  const cachedData = await queryCache(postId);

  if (cachedData) {
    const emailInfo = await sendEmail(email, JSON.stringify(cachedData), "NEW POST: "+postId, {
      FULLNAME: "Bilen Bilir"
    });
    responseJSON(response, {
      emailInfo,
      post: cachedData
    });
    return;
  }

  const url = `https://jsonplaceholder.typicode.com/posts/${postId}`;
  
  axios.get(url).then(async (resp)=>{
    await storePostToCache(postId, {...resp.data});

    const emailInfo = await sendEmail(email, JSON.stringify(resp.data), "NEW POST: "+postId, {
      FULLNAME: "Bilen Bilir"
    });
    responseJSON(response, {
      emailInfo,
      post: resp.data
    });

  }).catch((error)=>{
    console.log(error.response);
    responseError(response);
  });
}

module.exports = {
  get: getPostById,
  "mail-post-to": mailPostTo
}
