const { getFileNameString, formatBytes, responseError } = require("./util");
const { parseMultipartFormData } = require("./form-data-parser");

async function parseRequest(request, response) {
  const requestSize = request.headers["content-length"] ?? 0;
  console.log("Incoming request size is", formatBytes(requestSize));

  if (config.maxUploadSizeKB && requestSize > (config.maxUploadSizeKB*1024)) {
    responseError(response, {status: 400, message: "POST_SIZE_LIMIT_EXCEEDED"});
    return {error: {status: 400, message: "POST_SIZE_LIMIT_EXCEEDED"}};
  }

  return new Promise(async (resolve, reject) => {
    request.parsed = {}

    if (request.headers["content-type"] === "application/json") {
      parseJSONData(request).then(resolve);
      return;
    }

    const isFormData = request.headers["content-type"]?.startsWith?.("multipart/form-data");
    if (isFormData) {
      const parsed = await parseMultipartFormData(request, {});
      console.log(JSON.stringify(parsed, null, 2));
      resolve (parsed.data);
      return;
    }

    resolve(null);
  });
}

function parseJSONData(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', chunk => { body += chunk; });
    request.on('end', () => {
      try {
        let json = JSON.parse(body);
        request.parsed.json = json;
        resolve(json);
      } catch (e) {
        request.parsed.json = {};
        resolve(null);
      }
    });
  });
}

module.exports = {
  parseRequest,
};
