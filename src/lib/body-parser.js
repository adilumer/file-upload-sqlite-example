const { getFileNameString } = require("./util");

async function parseRequest(request) {
  return new Promise((resolve, reject) => {
    request.parsed = {}

    if (request.headers["content-type"] === "application/json") {
      parseJSONData(request).then(resolve);
      return;
    }

    const isFormData = request.headers["content-type"]?.startsWith?.("multipart/form-data");
    if (isFormData) {
      parseFormData(request).then(resolve);
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

function parseFormData(request) {
  return new Promise((resolve, reject) => {

    console.log(">>> parsing");
    const boundary = '--' + request.headers["content-type"]?.split('boundary=')[1];
    
    let body = "";
    request.on("data", (chunk) => { body += chunk; });
    request.on('end', () => {
      const parts = body.split(boundary).filter(part => part !== '' && part !== '--\r\n');
      const formData = {};

      parts.forEach((part) => {
        // Split headers and body for each part
        const [rawHeaders, rawBody] = part.split("\r\n\r\n");
        const headers = parseFormDataHeaders(rawHeaders);

        if (headers["content-disposition"]) {
          const contentDisposition = headers["content-disposition"];
          const nameMatch = contentDisposition.match(/name="([^"]+)"/);
          const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);

          if (nameMatch) {
            const fieldName = nameMatch[1];

            if (filenameMatch) {
              // Handle file uploads
              const filename = getFileNameString(filenameMatch[1]);
              // TODO: HANDLE BINARY FILES PROPERLY...
              const fileContent = Buffer.from(rawBody.split(0, -2), "binary"); // Properly handle binary data
              const filePath = path.join(request.publicDirectory, filename);

              // Save the file to disk as binary
              fs.writeFileSync(filePath, fileContent);

              formData[fieldName] = {
                filename,
                path: filePath,
                size: fileContent.length,
                mimeType: headers["content-type"],
              };
            } else {
              // Handle regular text fields
              const fieldValue = rawBody.slice(0, -2); // Removing trailing \r\n
              formData[fieldName] = fieldValue;
            }
          }
        }

        request.parsed.formData = formData;
        resolve(formData);
      });
    });
  });
}

module.exports = {
  parseRequest,
};
