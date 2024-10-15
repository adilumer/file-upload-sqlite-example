global.config = require("./config.json");
require("./model/common");

const createHttpServer = require("./lib/http-server");
const requestHandler = require("./route/index");
let httpServer = null;

db.initialize(async ()=>{
  httpServer = createHttpServer(requestHandler);
});
