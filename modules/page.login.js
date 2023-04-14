const { ipcMain } = require("electron");
const AccountManager = require("../com/AccountManager");
const { sendMessage, SingleWindow, onClose } = require("../com/mWindowMgr");
const crypto = require("crypto");
// 接收登录请求
ipcMain.on("login-form-submission", (event, arg) => {
  const { account, password } = arg;
  if (!AccountManager.getInstance().checkPassword(password)) {
    sendMessage("login", "login-error", {
      success: false,
      message: "账号或密码错误!",
    });
  } else {
    
    global.login = {
      success: true,
      passwordHash:crypto.createHash("sha256").update(password),
    };
    //跳转至主窗口
    AccountManager.getInstance().readFromFile();
    SingleWindow("main");
  }
});
