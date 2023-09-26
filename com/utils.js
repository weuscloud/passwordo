const { dialog } = require("electron");
const log = require("./log");
const path = require('path');
const { encryptedFileName } = require('./file');
function selectFile() {
  // 打开文件选择框
  const result = dialog.showOpenDialogSync({
    properties: ["openFile"],
    filters: [{ name: "AES256G files", extensions: [`${path.extname(encryptedFileName).replace('.','')}`] }],
  });

  if (result && result.length > 0) {
    const filePath = result[0];
    log('INFO', __filename, "导入保密文件-->", filePath);
    return filePath;
  }

  return null;
}
function matchValueByKey(str, data) {
  // 使用正则表达式匹配字符串中的 {} 内容
  var matches = str.match(/\{([^{}]+)\}/g);

  if (matches) {
    // 遍历匹配到的 key
    matches.forEach(function (match) {
      // 提取 key，去除 {} 并去除前后空格
      var key = match.replace(/[{}]/g, '').trim();

      // 使用 key 从 data 对象中获取对应的 value
      var value = data[key];

      // 如果找到了对应的 value，将字符串中的 key 替换为 value
      if (value !== undefined) {
        str = str.replace(match, value);
      }
    });
  }
  return str
}
module.exports = {
  selectFile,
  matchValueByKey
};
