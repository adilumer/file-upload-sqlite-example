const axios = require("axios");

function getPostById(request, response) {
  const postId = request.parsed.json.id;
  const url = `https://jsonplaceholder.typicode.com/posts/${postId}`;
  
  axios.get(url).then((resp)=>{
    response.writeHead(200, {"Content-Type": "application/json"});
    response.write(JSON.stringify(resp.data));
    response.end();
  }).catch((error)=>{
    console.log(error.response);
    response.writeHead(500, {'content-type': "text/plain"});
    response.write("Internal Server Error.");
    response.end();
  });
}

module.exports = {
  get: getPostById
}