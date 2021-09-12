const fs = require('fs');
const parse = require('csv-parse');
const async = require('async');

module.exports = function(filename, model, columns, doneLoadingCallback) {
  var input = fs.createReadStream(filename);
  var parser = parse({
    columns,
    relax: true
  });
  let count = 0;
  let error = undefined; 
  var inserter = async.cargo(function(entries, inserterCallback) {
    model.bulkCreate(entries).then(function() {
      inserterCallback();
    }).catch(e => {
      console.log(e.message);
      error = e;
      inserterCallback(e);
    });
  }, 500);
   
  parser.on('readable', function () {
    while(line = parser.read()) {
      count++;
      inserter.push(line, () => {
        count--;
        if (count === 0) {
          doneLoadingCallback(error);
        }
      });
    }
  });
   
  parser.on('end', function (cnt) {
    console.log('parsing file done');
    console.log(count, cnt);
  });
 
  input.pipe(parser);
} 

