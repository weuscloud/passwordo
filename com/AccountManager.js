const fs = require("fs");
const crypto = require("crypto");
const log = require("./log");
const { encryptedFileName } = require('./file');
// 定义加密函数
function encrypt(text, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]);
}

// 定义解密函数
function decrypt(buffer, key) {
  const iv = buffer.slice(0, 16);
  const tag = buffer.slice(16, 32);
  const data = buffer.slice(32);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted;
}
class AccountManager {
  accounts = [];
  encryptedFileName = encryptedFileName;
  static getInstance() {
    if (!AccountManager.instance) {
      AccountManager.instance = new AccountManager();
    }
    return AccountManager.instance;
  }
  setFilePath(path) {
    try {
      // 检查文件是否存在
      fs.accessSync(path, fs.constants.F_OK);
    } catch (error) {
      return false;
    }
    this.encryptedFileName = path;
    return true;
  }
  checkPassword(password) {
    if (!password) return false;
    const key = crypto.createHash("sha256").update(password).digest();
    if (!fs.existsSync(this.encryptedFileName)) return true;
    const inputFile = fs.readFileSync(this.encryptedFileName);
    const iv = inputFile.slice(0, 16);
    const tag = inputFile.slice(16, 32);
    const data = inputFile.slice(32);
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    try {
      decipher.update(data);
      decipher.final();
      return true;
    } catch (error) {
      log('INFO', __filename, "登录失败。");
      return false;
    }
  }
  deleteFile() {
    try {
      // 检查文件是否存在
      fs.accessSync(this.encryptedFileName, fs.constants.F_OK);
    } catch (error) {
      return false;
    }
    fs.unlinkSync(this.encryptedFileName);
    return true;
  }
  readFromFile(filePath) {
    const fileName = filePath || this.encryptedFileName;
    try {
      // 检查文件是否存在
      fs.accessSync(fileName, fs.constants.F_OK);
    } catch (error) {
      return "FILE NOT EXISTED";
    }

    if (!global.login.passwordHash)return "ADMIN PASSWORD NOT EXISTED";
    let key;

    if (!global.login.digestKey) {
      global.login.digestKey = global.login.passwordHash.digest();
    }

    key = global.login.digestKey;
    try {
      const inputFile = fs.readFileSync(fileName);
      const inputStr = decrypt(inputFile, key).toString();
      const lines = inputStr.split(/\r?\n/);

      for (const line of lines) {
        if (line.startsWith("uid=")) {
          //处理uid
          let uid = line.substring(
            line.indexOf("uid=") + 4,
            line.indexOf(",", line.indexOf("uid="))
          );
          if (line.indexOf("uid=") < 0) uid = "";

          let account = line.substring(
            line.indexOf("acc=") + 4,
            line.indexOf(",", line.indexOf("acc="))
          );
          if (line.indexOf("acc=") < 0) account = "";

          let tips = line.substring(
            line.indexOf("tips=") + 5,
            line.indexOf(",", line.indexOf("tips="))
          );
          if (line.indexOf("tips=") < 0) tips = "";

          let password = line.substring(
            line.indexOf("pwd=") + 4,
            line.indexOf(";", line.indexOf("pwd="))
          );
          if (line.indexOf("pwd=") < 0) password = "";

          this.accounts.push({ uid, account, tips, password });
        }
      }
    } catch (error) {
      log("ERROR", __filename, "保密文件密码不正确。");
      return "ADMIN PASSWORD NOT MATCH";
    }
    return "OK";
  }
  // 添加账号
  addAccount({ uid, account, password, tips }) {
    // 验证参数
    if (!this.validateUid(uid)) {
      return "Invalid uid";
    }
    if (!this.validateAccount(account)) {
      return "Invalid account";
    }
    if (!this.validatePassword(password)) {
      return "Invalid password";
    }
    if (!this.validTips(tips)) {
      return "Invalid tips";
    }
    if (this.findAccount(uid)) {
      return "Account existed";
    }
    // 创建账号对象并添加到数组中
    const newAccount = { uid, account, password, tips };
    this.accounts.push(newAccount);

    return "OK";
  }
  storeToFile() {
    let filepath = this.encryptedFileName;
    if (!global.login.passwordHash === true) return "保密文件密码不存在。";
    let data = "";
    for (const acc of this.accounts) {
      if (
        !this.validateUid(acc.uid) ||
        !this.validateAccount(acc.account) ||
        !this.validatePassword(acc.password) ||
        !this.validTips(acc.tips)
      ) {
        continue;
      }
      data += `uid=${acc.uid},acc=${acc.account},tips=${acc.tips},pwd=${acc.password};\n`;
    }
    let key;
    if (global.login.digestKey) {
      key = global.login.digestKey;
    } else {
      global.login.digestKey = global.login.passwordHash.digest();
      key = global.login.digestKey;
    }
    const encrypted = encrypt(data, key);
    try {
      fs.writeFile(this.encryptedFileName, encrypted, { flag: "w" }, (err) => {
        if (err) throw err;
      });
    } catch (error) {
      log('FATAL', __filename, "保密文件写权限不足");
      return "WRITE FILE  DENIED:\n" + this.encryptedFileName;
    }
    return "OK";
  }

  // 删除账号
  deleteAccount(uid) {
    // 找到账号对象的索引
    const index = this.accounts.findIndex((account) => account.uid === uid);
    if (index === -1) {
      log('WARNING', __filename, "Account not found");
      return false;
    }

    // 从数组中删除账号对象
    this.accounts.splice(index, 1);
    return true;
  }
  //同时更新账号和密码
  updateAll({ uid, tips, account, password }) {
    // 找到账号对象的索引
    const index = this.accounts.findIndex((account) => account.uid === uid);
    if (index === -1) {
      log('ERROR', __filename, "Account not found", uid);
      return "Account not found";
    }

    // 验证新密码是否符合要求
    if (!this.validatePassword(password)) {
      return "Invalid password for";
    }
    // 验证新账号名是否符合要求
    if (!this.validateAccount(account)) {
      return "Invalid account for";
    }
    //验证新备注是否符合要求
    if (!this.validTips(tips)) {
      return "Invalid tips for";
    }
    this.accounts[index].account = account;
    this.accounts[index].password = password;
    this.accounts[index].tips = tips;
    return "OK";
  }
  // 更新账号密码
  updatePassword(uid, newPassword) {
    // 找到账号对象的索引
    const index = this.accounts.findIndex((account) => account.uid === uid);
    if (index === -1) {
      log("Account not found", uid);
      return false;
    }

    // 验证新密码是否符合要求
    if (!this.validatePassword(newPassword)) {
      return false;
    }

    // 更新账号密码
    this.accounts[index].password = newPassword;
    return true;
  }
  //更新账号名
  updateAccount(uid, newAccount) {
    // 找到账号对象的索引
    const index = this.accounts.findIndex((account) => account.uid === uid);
    if (index === -1) {
      log('ERROR', __filename, "Account not found", uid);
      return false;
    }

    // 验证新账号名是否符合要求
    if (!this.validateAccount(newAccount)) {
      return false;
    }

    // 更新账号名
    this.accounts[index].account = newAccount;
    return true;
  }
  updateTips(uid, newTips) {
    // 找到账号对象的索引
    const index = this.accounts.findIndex((account) => account.uid === uid);
    if (index === -1) {
      return false;
    }
    // 验证新账号名是否符合要求
    if (!this.validTips(newTips)) {
      return false;
    }
    // 更新账号名
    this.accounts[index].tips = newTips;
    return true;
  }
  // 查找账号
  findAccount(uid) {
    const account = this.accounts.find((account) => account.uid === uid);
    if (!account) {
      log('ERROR', __filename, "Account not found");
      return null;
    }
    return account;
  }

  // 验证 uid 是否为 9 位数字
  validateUid(uid) {
    return /^\d{9}$/.test(uid);
  }
  validTips(tips) {
    return typeof tips === "string" && tips.length <= 400;
  }
  // 验证 account 是否为移动号码或者任意邮箱
  validateAccount(account) {
    return /^1\d{10}$|^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(account);
  }
  query() {
    return this.accounts;
  }
  queryUID() {
    let uid = [];
    for (const account of this.accounts) {
      uid.push(account.uid);
    }
    uid.sort((a, b) => {
      return a - b;
    });
    return uid;
  }
  queryAccount(uid) {
    let acc = this.findAccount(uid);
    if (acc) {
      return acc.account;
    }
    return "";
  }
  queryPassword(uid) {
    let acc = this.findAccount(uid);
    if (acc) {
      return acc.password;
    }
    return "";
  }
  // 验证 password 是否为 8-15 位
  validatePassword(password) {
    return (
      typeof password === "string" &&
      password.length >= 8 &&
      password.length <= 15
    );
  }
}
module.exports = AccountManager;
