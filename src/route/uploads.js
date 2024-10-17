function uploadFile(request, response) {

  if(!request.parsed.formData){
    response.writeHead(417, {'content-type': "text/plain"});
    response.write("Invalid parameter.");
    response.end();
    return;
  }

  try {
    response.writeHead(200, {"Content-Type": "application/json"});
    response.write(JSON.stringify(request.parsed.formData));
    response.end();
  } catch(e){
    console.log(e);
    response.writeHead(500, {'content-type': "text/plain"});
    response.write("Internal Server Error.");
    response.end();
  }
} 

module.exports = uploadFile;