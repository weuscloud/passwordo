const { ipcMain } = require("electron");
const AccountManager = require("./AccountManager");
const { sendMessage, SingleWindow, onClose } = require("./WindowMgr");
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

//重置账号
ipcMain.on("reset-password", (e,a)=>{
  const success=AccountManager.getInstance().deleteFile();
  sendMessage("login","reset-password-reply",{success})
});