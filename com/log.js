const fs = require('fs');

const { app } = require("electron");
const path = require("path");
const logFileName = path.join(app.getPath('userData'), `passwordo.log`);

function getCurrentTimestamp() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const hours = String(currentDate.getHours()).padStart(2, '0');
  const minutes = String(currentDate.getMinutes()).padStart(2, '0');
  const seconds = String(currentDate.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
//INFO,WARNING,DEBUG,ERROR,FATAL
function log(level, module,... args) {
  const message = args.join(' ');
  const validLevels = ['INFO', 'WARNING', 'DEBUG', 'ERROR', 'FATAL'];
  if (!validLevels.includes(level)) {
    level='INFO'
  }
  fs.appendFileSync(logFileName, `${getCurrentTimestamp()} [${level}] [${module}] ${message}\n`);
}
module.exports = log
