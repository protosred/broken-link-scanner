const csv = require('fast-csv');
const fs = require('fs');

exports.read = function (filePath) {
  const rows = [];

  return new Promise(resolve => {
    csv
     .fromPath(filePath, { headers: true })
     .on("data", function(data){
        rows.push(data);
     })
     .on("end", function(){
        resolve(rows);
     })
  })
}

exports.write = function (filePath, data) {
  return new Promise(resolve => {
    csv
       .writeToPath(filePath, data, {headers: true})
       .on("finish", function(){
          setTimeout(resolve, 2000);
       });
  })
}