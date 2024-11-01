const { getFileNameString, formatBytes, responseError } = require("./util");

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

function preCheck(request, options){
  // content header type check
  const isFormData = request.headers["content-type"]?.startsWith?.("multipart/form-data");
  if (!isFormData) {
    return {status: 400, message: "INVALID_CONTENT_TYPE"};
  }

  // Size check
  const requestSize = request.headers["content-length"] ?? 0;
  if (options.maxSizeKB && requestSize > (options.maxSizeKB*1024)) {
    return {status: 400, message: "SIZE_LIMIT_EXCEEDED"};
  }

  return null;
}

function handleReqClosing(premature, filesWritten) {
  if(!premature) return;

  if (filesWritten.length) {
    filesWritten.forEach((file)=> {
      fs.unlink(file, (err)=>{
        // if err...
      });
    });
  }
}

async function parseMultipartFormData(request, options) {
  const preCheckError = preCheck(request, options);
  if (preCheckError) {
    return {err: preCheckError, data: null};
  }
  
  let requestCompleted = false;
  let filesWritten = [];
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

          if (!result[fieldName]) result[fieldName] = [];
          
          result[fieldName].push({
            filename,
            path: filePath,
            size: fileBuffer.length,
            mimeType: fileHeaders["content-type"],
          });

          filesWritten.push(filePath);
        } else if (fieldName) {
          result[fieldName] = body.slice(0, body.length - 2).toString(); // Remove trailing \r\n
        }
      });

      requestCompleted = true;
      resolve({err: null, data: result});    
    });

    request.on('close', () => {
      handleReqClosing(!requestCompleted, filesWritten);
      if (!requestCompleted) {
        resolve({err: {status: 400, message: "REQUEST_PREMATURELY_CLOSED"}, data: null});
      }
    });
    
    request.on('error', (e) => {
      handleReqClosing(!requestCompleted, filesWritten);
      resolve({err: e, data: null});
    });
    
  });

}


module.exports = {
  parseMultipartFormData
}