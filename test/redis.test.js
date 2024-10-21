const redisClient = require("../src/lib/redis-client");

beforeAll(async () => {
  const redis = await redisClient.createRedisClient();
});


test('Check if value for foo is set', async () => {
  const obj = {
    foo: "bar",
    bar: "baz",
    baz: "asd",
  }
  const isSet = await redisClient.setCache("foo", obj);
  expect(isSet).toBe(true);
});

test('Check if value for foo.bar is baz', async () => {
  const data = await redisClient.getCachedData("foo", true);
  expect(data.bar).toBe("baz");
});


afterAll(async () => {
  redisClient.closeClient();
});