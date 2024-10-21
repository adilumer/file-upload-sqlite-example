const { responseJSON, responseError } = require("../lib/util");

function uploadFile(request, response) {

  if(!request.parsed.formData){
    responseError(response, {status: 417, message: "Invalid parameter."});
    return;
  }

  try {
    responseJSON(response, request.parsed.formData);
  } catch(e){
    console.log(e);
    responseError(response);
  }
} 

module.exports = uploadFile;