const { dialog } = require("electron");
const log = require("./log");
function selectFile() {
  // 打开文件选择框
  const result = dialog.showOpenDialogSync({
    properties: ["openFile"],
    filters: [{ name: "AES256G files", extensions: ["aes256g"] }],
  });

  if (result && result.length > 0) {
    const filePath = result[0];
    log('INFO',__filename,"file import path=", filePath);
    return filePath;
  }

  return null;
}
module.exports = {
  selectFile,
};
