const http = require("http");
const https = require("https");

function createHttpServer(requestHandler){
  const httpServer = http.createServer(requestHandler);
  //const httpsOptions = {}
  //const httpsServer = https.createServer(httpsOptions, requestHandler);
  
  httpServer.listen(httpServerPort, () => {
    console.log(httpServerPort, "portunda dinliyorum");
  });

  return httpServer;
}

module.exports = createHttpServer;