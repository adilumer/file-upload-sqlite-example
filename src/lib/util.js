
module.exports.makeSortString = function(s) {
  if (!s) return "";
  var translate_tr = /[ĞÜŞİÖÇğüşıöç]/g;
  var translate = {
    "ı": "i", "ö": "o", "ü": "u",
    "İ": "I", "Ö": "O", "Ü": "U",
    "Ş": "S", "ş": "s", "Ğ": "G",
    "ğ": "g", "Ç": "C", "ç": "c"
  };
  return ( s.replace(translate_tr, function(match) { 
    return translate[match]; 
  }) );
}

module.exports.getFileNameString = function(s){
  if(!s) return 'upload_'+Date.now();
  
  return module.exports.makeSortString(s.replace(/\s/g, "-") );
}

module.exports.formatBytes = function (bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

module.exports.responseJSON = function (response, data) {
  response.writeHead(200, {"Content-Type": "application/json"});
  response.write(JSON.stringify(data));
  response.end();
}

module.exports.responseError = function (response, error) {
  response.writeHead(error?.status || 500, {'content-type': "text/plain"});
  response.write(error?.message || "Internal Server Error.");
  response.end();
}

module.exports.responseText = function (response, data) {
  response.writeHead(data?.length ? 200 : 204, {'content-type': "text/plain"});
  response.write(data || "No Content.");
  response.end();
}
