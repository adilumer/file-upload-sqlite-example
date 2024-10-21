const { createClient } = require('redis'); 
let RedisClient = null;

async function createRedisClient() {
  const client = await createClient()
    .on('error', err => console.log('Redis Client Error', err))
    .connect();
    
  RedisClient = client;  
  return client;
}

async function getCachedData(key, expectsJSON) {
  if(!RedisClient.isReady) {
    return null;
  }

  const data = await RedisClient.get(key);
  
  if(expectsJSON && data?.length > 0) {
    return JSON.parse(data);
  }

  return data;
}

async function setCache(key, data){
  if(!RedisClient.isReady) {
    return false;
  }

  if (typeof data === "object") {
    data = JSON.stringify(data);
  }

  await RedisClient.set(key, data);
  
  return true;
}

function closeClient() {
  if(!RedisClient.isOpen) {
    return null;
  }

  console.log("closing redis client..");
  RedisClient.disconnect();
  return true;
}

module.exports = {
  createRedisClient,
  closeClient,
  getCachedData,
  setCache
} 