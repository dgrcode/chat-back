const fs = require('fs');

const parentDir = __dirname + "/data";
const dir = __dirname + "/data/db";

if (!fs.existsSync(dir)) {
  fs.mkdirSync(parentDir);
  fs.mkdirSync(dir);
}
