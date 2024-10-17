
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