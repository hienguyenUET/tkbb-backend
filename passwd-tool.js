const args = process.argv.slice(2)

if (args.length === 0) {
  console.log("node passwd-tool.js <plain password>");
  process.exit(-1)
}

const bcrypt = require('bcrypt');
let hashPassword = bcrypt.hashSync(args[0], 5);
console.log(args[0], hashPassword)
