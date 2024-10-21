const redisClient = require("../src/lib/redis-client");

async function runTest (){
  const redis = await redisClient.createRedisClient();

  const obj = {
    foo: "bar",
    bar: "baz",
    baz: "asd",
  }

  const isSet = await redisClient.setCache("foo", obj);
  console.log("isSet", isSet);

  const data = await redisClient.getCachedData("foo", true);
  console.log("foo is", data);
}

runTest();