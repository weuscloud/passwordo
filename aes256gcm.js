const fs = require('fs');
const crypto = require('crypto');

// 定义加密函数
function encrypt(text, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]);
}

// 定义解密函数
function decrypt(buffer, key) {
  const iv = buffer.slice(0, 16);
  const tag = buffer.slice(16, 32);
  const data = buffer.slice(32);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted;
}

// 获取命令行参数
const args = process.argv.slice(2);
const filename = args[0];
const password= args[1];
// 判断是加密还是解密
if (filename.endsWith('.aes256g')) {
  if(!filename||!password)return -1;
  // 解密
  const key = crypto.createHash('sha256').update(password).digest();
  const inputFile = fs.readFileSync(filename);
  const outputFile = `${filename.replace('.aes256g',"")}`;
  const decrypted = decrypt(inputFile, key);
  fs.writeFileSync(outputFile, decrypted);
  console.log(`${filename} 解密成功，\n生成文件：\n${outputFile}`);
} else {
  // 加密
  if(!filename||!password)return -1;
  const key = crypto.createHash('sha256').update(password).digest();
  const inputFile = fs.readFileSync(filename);
  const outputFile = `${filename}.aes256g`;
  const encrypted = encrypt(inputFile, key);
  fs.writeFileSync(outputFile, encrypted);
  console.log(`${filename} 加密成功，\n生成文件：\n${outputFile}`);
}
