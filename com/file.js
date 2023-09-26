const { app } = require("electron");
const fs = require('fs').promises;
const path = require("path");
const log = require('./log');
const { exit } = require("process");

class FileOperation {
  constructor(filePath, { encoding = 'utf-8', defaultContent = '' } = {}) {
    this.filePath = filePath;
    this.options = { encoding, defaultContent };
  }

  async fileExists() {
    try {
      await fs.access(this.filePath, fs.constants.F_OK);
      return true;
    } catch (err) {
      return false;
    }
  }

  async createEmptyFile() {
    try {
      await fs.writeFile(this.filePath, this.options.defaultContent, { encoding: this.options.encoding });
      log('INFO','file.js',`已创建空白文件${this.filePath} `);
    } catch (err) {
      console.error(`无法创建空白文件 ${this.filePath}: ${err.message}`);
    }
  }
}

async function main() {

  for (const file of filesToCheck) {
    const fileOperation = new FileOperation(file.path, { defaultContent: file.content });
    if (!(await fileOperation.fileExists())) {
      await fileOperation.createEmptyFile();
    }
  }
}
const encryptedFileName = path.join(app.getPath("userData"), "passwordo.aes256g");
const iniFileName = path.join(app.getPath("userData"), "user.json");
const logFileName = path.join(app.getPath('userData'), `passwordo.log`);
const getBackupFileName =()=>{const unixTimestampInSeconds = Math.floor(Date.now() / 1000);return `${path.dirname(iniFileName)}\\bak.${unixTimestampInSeconds}.${path.basename(encryptedFileName)}`};
const filesToCheck = [
  { path: encryptedFileName },
  { path: iniFileName},
  // ,content:`{"GenshinInstallPath":"%ProgramFiles%\\Genshin Impact\\Genshin Impact Game\\yuanshen.exe"}` 
  { path: logFileName },
  // 可以添加更多文件路径和默认内容
];
if (!global.fileInitialized) {
  main().catch((err) => {
    log('FATAL','file.js','所需文件初始化错误', err);
    exit(-1);
  });
  global.fileInitialized = true
}
module.exports = {
  encryptedFileName,
  iniFileName,
  getBackupFileName
}