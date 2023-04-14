const fs = require('fs');
const { app } = require('electron');
const path = require('path');
function log(type, ...args) {
  const date = new Date();
  const dateString = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
  const fileName = path.join(app.getPath('userData'),`${dateString}.log`);
  const message = args.join(' ');
  
  switch (type) {
    case 1:
      console.log(message);
      break;
    case 2:
      console.warn(message);
      break;
    case 3:
      console.error(message);
      break;
    default:

      console.log(type,message);
  }
  
  fs.appendFileSync(fileName, `${message}\n`);
}

module.exports=log
