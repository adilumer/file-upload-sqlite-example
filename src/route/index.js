const { parseRequest } = require("../lib/body-parser");

const routes = {
  user: require("./user"),
  posts: require("./posts"),
}

function defaultHandler(request, response) {
  response.writeHead(404, {'content-type': "text/plain"});
  response.write("Not Found.");
  response.end();
}

function getHandlerFromPath(request){
  const pathComponents = request.url.split("/").filter(x => x !== "");
  
  if (pathComponents.length === 1 && typeof routes[pathComponents[0]] === "function") {
    return routes[pathComponents[0]];
  }

  if (pathComponents.length === 2 && typeof routes[pathComponents[0]]?.[pathComponents[1]] === "function") {
    return routes[pathComponents[0]][pathComponents[1]] ;
  }

  return defaultHandler;
}

async function requestHandler(request, response) {
  console.log(">", request.url || "/");

  const parsedBody = await parseRequest(request);
  console.log(">>", parsedBody);

  const handler = getHandlerFromPath(request);

  try { 
    handler(request, response);
  } catch (e) {
    response.writeHead(500, {'content-type': "text/plain"});
    response.write("Internal Server Error.");
    response.end();
  }
}

module.exports = requestHandler;