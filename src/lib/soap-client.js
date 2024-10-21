const soap = require('soap');

// URL of the WSDL (Web Services Description Language)
const WSDL_URL = 'http://www.dneonline.com/calculator.asmx?wsdl';

// Create a SOAP client
async function Add(intA, intB){
  const client = await soap.createClientAsync(WSDL_URL);
  return new Promise ((resolve, reject)=>{
    client.Add({intA, intB}, (error, response)=>{
      if (error || !response){ 
        resolve(null); 
      } else {
        resolve(response);
      }
    });
  }); 
}

async function Subtract(intA, intB){
  const client = await soap.createClientAsync(WSDL_URL);
  const result = await client.SubtractAsync({intA, intB});
  return result;
}

module.exports = {
  Add,
  Subtract,
}

/*
// Example SOAP request
const requestParams = {
  intA: 10,
  intB: 5,
};

// Function to create a SOAP client and make a request
async function callSoapService() {
  try {

    // Call a method (e.g., 'Add') on the SOAP service
    client.Subtract(requestParams, (err, res)=>{
      console.log(res);
    });

    const [ result ] = await client.AddAsync(requestParams);
    console.log(result);
  } catch (err) {
    console.error('Error:', err);
  }
}

// Call the SOAP service
callSoapService();
*/