const UserModel = require("../model/user");

async function createUser(request, response) {
  const {name, email} = request.parsed.json;

  const user = await UserModel.create(name, email);
    
  response.writeHead(200, {"Content-Type": "application/json"});
  response.write(JSON.stringify(user));
  response.end();
}

async function getUser(request, response) {
  const userId = request.parsed.json.id;

  if(isNaN(Number(userId))) {
    response.writeHead(417, {"Content-Type": "text/plain"});
    response.write("Invalid parameter.");
    response.end();
    return;
  }

  const user = await UserModel.getById(userId);

  if(user) {
    response.writeHead(200, {"Content-Type": "application/json"});
    response.write(JSON.stringify(user));
    response.end();

    return;
  } 

  response.writeHead(204, {"Content-Type": "text/plain"});
  response.write("No Content.");
  response.end();
}

module.exports = {
  create: createUser,
  get: getUser,
}