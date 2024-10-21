const UserModel = require("../model/user");
const { responseJSON, responseError, responseText } = require("../lib/util");

async function createUser(request, response) {
  console.log(">>>");
  const {name, email} = request.parsed.json;

  const user = await UserModel.create(name, email);
  responseJSON(response, user);
}

async function getUser(request, response) {
  const userId = request.parsed.json.id;

  if(isNaN(Number(userId))) {
    responseError(response, {status: 417, message: "Invalid parameter."});
    return;
  }

  const user = await UserModel.getById(userId);

  if(user) {
    responseJSON(response, user);
    return;
  } 

  responseText(response);
}

module.exports = {
  create: createUser,
  get: getUser,
}