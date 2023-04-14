const fs = require("fs");
const crypto = require("crypto");
const log = require("./log");
const { app } = require('electron');
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
  encryptedFileName =app.getPath('userData')+"passwordo.aes256g";
  static getInstance() {
    if (!AccountManager.instance) {
      AccountManager.instance = new AccountManager();
    }
    return AccountManager.instance;
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
      log("login failed!");
      return false;
    }
  }

  readFromFile() {
    if (!fs.existsSync(this.encryptedFileName)) return;
    if (!global.login.passwordHash === true) return;
    let key;
    if (global.login.digestKey) {
      key = global.login.digestKey;
    } else {
      global.login.digestKey = global.login.passwordHash.digest();
      key = global.login.digestKey;
    }

    try {
      const inputFile = fs.readFileSync(this.encryptedFileName);
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
      log("decrypted failed!\n", error);
    }
  }
  // 添加账号
  addAccount({ uid, account, password, tips }) {
    // 验证参数
    if (!this.validateUid(uid)) {
      log("Invalid uid", uid);
      return "Invalid uid";
    }
    if (!this.validateAccount(account)) {
      log("Invalid account", uid);
      return "Invalid account";
    }
    if (!this.validatePassword(password)) {
      log("Invalid password", uid);
      return "Invalid password";
    }
    if (!this.validTips(tips)) {
      log("Invalid tips", uid);
      return "Invalid tips";
    }
    if (this.findAccount(uid)) {
      log("Account existed", uid);
      return "Account existed";
    }
    // 创建账号对象并添加到数组中
    const newAccount = { uid, account, password, tips };
    this.accounts.push(newAccount);

    return "OK";
  }
  storeToFile() {
    let filepath = this.encryptedFileName;
    try {
      // 检查文件是否存在
      fs.accessSync(filepath, fs.constants.F_OK);

      // 文件存在，什么也不做
      log("File already exists:", filepath);
    } catch (error) {
      // 文件不存在，尝试创建文件
      try {
        fs.writeFileSync(filepath, "");
        log("File created successfully:", filepath);
      } catch (error) {
        // 权限不足，退出
        log("Failed to create file:", error);
        return "FILE ACCESS DENIED:\n"+filepath;
      }
    }
    if (!global.login.passwordHash === true) return "PASSWORD NOT EXISTED";
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
      log("WRITE FILE  DENIED");
      return "WRITE FILE  DENIED:\n"+this.encryptedFileName;
    }
    return "OK";
  }

  // 删除账号
  deleteAccount(uid) {
    // 找到账号对象的索引
    const index = this.accounts.findIndex((account) => account.uid === uid);
    if (index === -1) {
      log("Account not found");
      return false;
    }

    // 从数组中删除账号对象
    this.accounts.splice(index, 1);
    log("Account deleted:", uid);
    return true;
  }
  //同时更新账号和密码
  updateAll({ uid, tips, account, password }) {
    // 找到账号对象的索引
    const index = this.accounts.findIndex((account) => account.uid === uid);
    if (index === -1) {
      log("Account not found", uid);
      return "Account not found";
    }

    // 验证新密码是否符合要求
    if (!this.validatePassword(password)) {
      log("Invalid password for", uid);
      return "Invalid password for";
    }
    // 验证新账号名是否符合要求
    if (!this.validateAccount(account)) {
      log("Invalid account for", uid);
      return "Invalid account for";
    }
    if (!this.validTips(tips)) {
      log("Invalid tips for", uid);
      return "Invalid tips for";
    }
    this.accounts[index].account = account;
    this.accounts[index].password = password;
    this.accounts[index].tips = tips;
    log("Password and Account updated for ", uid);
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
      log("Invalid password", uid);
      return false;
    }

    // 更新账号密码
    this.accounts[index].password = newPassword;
    log("Password updated for account", uid);
    return true;
  }
  //更新账号名
  updateAccount(uid, newAccount) {
    // 找到账号对象的索引
    const index = this.accounts.findIndex((account) => account.uid === uid);
    if (index === -1) {
      log("Account not found", uid);
      return false;
    }

    // 验证新账号名是否符合要求
    if (!this.validateAccount(newAccount)) {
      log("Invalid account", uid);
      return false;
    }

    // 更新账号名
    this.accounts[index].account = newAccount;
    log("Password updated for account", uid);
    return true;
  }
  updateTips(uid, newTips) {
    // 找到账号对象的索引
    const index = this.accounts.findIndex((account) => account.uid === uid);
    if (index === -1) {
      log("Account not found", uid);
      return false;
    }
    // 验证新账号名是否符合要求
    if (!this.validTips(newTips)) {
      log("Invalid Tips", uid);
      return false;
    }
    // 更新账号名
    this.accounts[index].tips = newTips;
    log("Tips updated for account", uid);
    return true;
  }
  // 查找账号
  findAccount(uid) {
    const account = this.accounts.find((account) => account.uid === uid);
    if (!account) {
      log("Account not found");
      return null;
    }

    log("Account found:", account.uid);
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
