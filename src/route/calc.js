const CalcService = require("../lib/soap-client");

async function add(request, response) {
  const {intA, intB} = request.parsed.json;

  const result = await CalcService.Add(intA,intB);
  
  response.writeHead(200, {"Content-Type": "application/json"});
  response.write(JSON.stringify(result || {}));
  response.end();
}

async function subtract(request, response) {
  const {intA, intB} = request.parsed.json;

  const [ result ] = await CalcService.Subtract(intA,intB);
  
  response.writeHead(200, {"Content-Type": "application/json"});
  response.write(JSON.stringify(result || {}));
  response.end();
}

module.exports = {
  add: add,
  subtract: subtract
}