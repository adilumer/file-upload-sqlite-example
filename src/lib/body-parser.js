const { getFileNameString, formatBytes } = require("./util");

async function parseRequest(request) {
  const requestSize = request.headers["content-length"] ?? 0;
  console.log("Incoming request size is", formatBytes(requestSize));

  return new Promise((resolve, reject) => {
    request.parsed = {}

    if (request.headers["content-type"] === "application/json") {
      parseJSONData(request).then(resolve);
      return;
    }

    const isFormData = request.headers["content-type"]?.startsWith?.("multipart/form-data");
    if (isFormData) {
      parseMultipartFormData(request).then(resolve);
      return;
    }

    resolve(null);
  });
}

function parseFormDataHeaders(headerBlock) {
  //field:value\r\nfield2:value2\r\n
  const headers = {};
  const headerLines = headerBlock.split("\r\n");
  headerLines.forEach((line) => {
    const [k, v] = line.split(":");
    headers[k.toLowerCase()] = v;
  });

  return headers;
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

/**
 * Sample Raw FormData request
 * 
 * POST /upload HTTP/1.1
Host: localhost:5050
Content-Length: 248
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="testfileld"

testvalue
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="sdjflakjsd"

askdfjlksadjf
------WebKitFormBoundary7MA4YWxkTrZu0gW--

 */

function splitBuffer(buffer, boundary) {
  const boundaryBuffer = Buffer.from(boundary);
  const parts = [];
  let start = 0;

  while (true) {
    const boundaryIndex = buffer.indexOf(boundaryBuffer, start);
    if (boundaryIndex === -1) break;
    parts.push(buffer.slice(start, boundaryIndex));
    start = boundaryIndex + boundaryBuffer.length;
  }

  return parts;
}

function splitBufferAt(buffer, separator) {
  const separatorIndex = buffer.indexOf(separator);
  if (separatorIndex === -1) return [buffer, Buffer.alloc(0)];
  const header = buffer.slice(0, separatorIndex);
  const body = buffer.slice(separatorIndex + separator.length);
  return [header, body];
}


function parseMultipartFormData(request) {
  const boundary = '--' + request.headers["content-type"]?.split('boundary=')[1];

  return new Promise((resolve, reject) => {
    let buffer = Buffer.alloc(0);

    // Collect incoming data chunks
    request.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
    });

    request.on('end', () => {
      const parts = splitBuffer(buffer, boundary);
      const result = {};
      
      parts.forEach((part) => {
        const [header, body] = splitBufferAt(part, Buffer.from('\r\n\r\n'));
        const headerStr = header.toString();
        const dispositionMatch = headerStr.match(/name="([^"]+)"/);
        const fileNameMatch = headerStr.match(/filename="([^"]+)"/);
        
        const fieldName = dispositionMatch ? dispositionMatch[1] : null;
        const isFile = fileNameMatch != null;
        
        if (isFile) {
          const fileHeaders = parseFormDataHeaders(headerStr);

          const fileBuffer = body.slice(0, body.length - 2); // Remove trailing \r\n

          const filename = getFileNameString(fileNameMatch[1]);
          const filePath = path.join(request.publicDirectory, filename);

          // Save the file to disk as binary
          fs.writeFileSync(filePath, fileBuffer);

          result[fieldName] = {
            filename,
            path: filePath,
            size: fileBuffer.length,
            mimeType: fileHeaders["content-type"],
          };
        } else if (fieldName) {
          result[fieldName] = body.slice(0, body.length - 2).toString(); // Remove trailing \r\n
        }
      });

      request.parsed.formData = result;
      resolve(result);
    
    });
  });
}

module.exports = {
  parseRequest,
};
