const { parseRequest } = require("../lib/body-parser");
const publicDirectory = path.join(__dirname, "..", "static");
const { responseError } = require("../lib/util");

const routes = {
  user: require("./user"),
  posts: require("./posts"),
  calc: require("./calc"),
  upload: require("./uploads"),
}

function defaultHandler(request, response) {
  responseError(response, {status: 404, message: "Not Found."});
}

function getHandlerFromPath(request){
  const pathComponents = request.url.toLowerCase()?.split("/").filter(x => x !== "") || [];
  
  if (pathComponents.length === 1 && typeof routes[pathComponents[0]] === "function") {
    return routes[pathComponents[0]];
  }

  if (pathComponents.length === 2 && typeof routes[pathComponents[0]]?.[pathComponents[1]] === "function") {
    return routes[pathComponents[0]][pathComponents[1]] ;
  }

  return null;
}

async function findStaticFile(_path) {
  const filePath = path.join(publicDirectory, _path);

  const exists = await fs.existsSync(filePath);
  if (!exists) {  return null; }

  const fileStat = fs.statSync(filePath);
  if(fileStat.isFile()) {
    return {
      path: filePath,
      mime: config.mimeTypes[path.extname(filePath)] || "application/octet-stream"
    }
  }
  
  return null;
}

async function serveStaticFile(staticFile, response) {
  try {
    const readStream = fs.createReadStream(staticFile.path);
    response.writeHead(200, {'Content-Type': staticFile.mime});
    readStream.pipe(response);
    //readStream.on("end", response.end);
    // Handle stream errors
    readStream.on('error', (streamErr) => {
      res.writeHead(500);
      res.end(`File stream error: ${streamErr.message}`);
    });
  } catch (e) {
    response.end("Internal Server Error");
  }
}

async function requestHandler(request, response) {
  console.log(">", request.url || "/");

  request.publicDirectory = publicDirectory;

  const parsedBody = await parseRequest(request, response);

  if(parsedBody.error) {
    return;
  }

  let handler = getHandlerFromPath(request);

  if(handler === null)  {
    const staticFile = await findStaticFile(request.url);
    if (staticFile !== null) {
      await serveStaticFile(staticFile, response);
      return;
    } 

    handler = defaultHandler;
  }

  try { 
    handler(request, response);
  } catch (e) {
    console.log(e);
    responseError(response);
  }
}

module.exports = requestHandler;