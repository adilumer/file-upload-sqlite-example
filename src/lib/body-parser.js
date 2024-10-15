async function parseRequest(request) {
  return new Promise((resolve, reject) => {
    request.parsed = {};
    let body = "";

    if (request.headers['content-type'] === "application/json"){
      request.on("data", (chunk)=>{
        body += chunk;
      });
      request.on("end", ()=>{
        try{
          let json = JSON.parse(body);
          request.parsed.json = json;
          resolve(json);
        }catch(e){
          resolve(null);
        }
      });
    }
  });
}

module.exports = {
  parseRequest,
}