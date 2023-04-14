const fs = require("fs");
const crypto = require("crypto");

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

function UnLock(filename, password) {
  if (filename.endsWith(".aes256g")) {
    if (!filename || !password) return -1;
    // 解密
    const key = crypto.createHash("sha256").update(password).digest();
    const inputFile = fs.readFileSync(filename);
    const outputFile = `${filename.replace(".aes256g", "")}`;
    try {
      const decrypted = decrypt(inputFile, key);
      fs.writeFileSync(outputFile, decrypted);
      console.log("decrypted!");
      return 0;
    } catch (error) {
      console.error("decrypt failed!");
      return -1;
    }
  } else {
    return -1;
  }
}
function checkPassword(filename, password) {
  if (filename.endsWith(".aes256g")) {
    if (!filename || !password) return false;
    const key = crypto.createHash("sha256").update(password).digest();
    const inputFile = fs.readFileSync(filename);

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
      console.error("decrypt failed!");
      return false;
    }
  } else {
    return false;
  }
}

function Lock(filename, password) {
  // 加密
  if (!filename || !password) return -1;
  const key = crypto.createHash("sha256").update(password).digest();

  try {
    const inputFile = fs.readFileSync(filename);
    const outputFile = `${filename}.aes256g`;
    const encrypted = encrypt(inputFile, key);
    fs.writeFileSync(outputFile, encrypted);
    console.log("encrypted!");
    return 0;
  } catch (error) {
    console.error("encrypt failed!");
    return -1;
  }
}
// 获取命令行参数
if (process.argv) {
  const args = process.argv.slice(2);
  const filename = args[0];
  const password = args[1];
  if (filename && password) {
    if (filename.endsWith(".aes256g")) {
      UnLock(filename, password);
    } else {
      Lock(filename, password);
    }
  }
}
module.exports = {
  Lock,
  UnLock,
  checkPassword,
};
