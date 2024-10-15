const http = require("http");

function createHttpServer(requestHandler){
  const httpServer = http.createServer(requestHandler);
  
  httpServer.listen(httpServerPort, () => {
    console.log(httpServerPort, "portunda dinliyorum");
  });

  return httpServer;
}

module.exports = createHttpServer;