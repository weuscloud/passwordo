const { ipcMain } = require("electron");
const AccountManager = require("./AccountManager");
const { sendMessage, SingleWindow } = require("./WindowMgr");
const crypto = require("crypto");
const path = require("path");
const { selectFile } = require("./utils");
const log = require("./log");
// 接收登录请求
ipcMain.on("login-form-submission", (event, arg) => {
  const { account, password } = arg;
  if (!AccountManager.getInstance().checkPassword(password)) {
    sendMessage("login", "login-error", {
      success: false,
      message: "{loginfailed}",
    });
  } else {
    global.login = {
      success: true,
      passwordHash: crypto.createHash("sha256").update(password),
    };
    //跳转至主窗口
    AccountManager.getInstance().readFromFile();
    SingleWindow("main");
  }
});

//重置账号
ipcMain.on("reset-password", (e, a) => {
  const success = AccountManager.getInstance().deleteFile();
  sendMessage("login", "reset-password-reply", { success });
});

//选择文件
ipcMain.on("select-file", (event) => {
  const filePaths = selectFile();
  if (filePaths && filePaths.length > 0) {
    AccountManager.getInstance().setFilePath(filePaths);
    const fileNameWithExt = path.basename(filePaths);
    const fileName = fileNameWithExt.slice(0, fileNameWithExt.lastIndexOf("."));
    sendMessage("login", "select-file-reply", { fileName });
  }
});
