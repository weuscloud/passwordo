const { app, ipcMain, ipcRenderer } = require("electron");
const AccountManager = require("./com/AccountManager");
const { sendMessage } = require("./mWindowMgr");
//manage
//查询
ipcMain.on("query-account", () => {
  sendMessage(
    "manage",
    "query-account-reply",
    AccountManager.getInstance().query()
  );
});
//删除
ipcMain.on("delete-account", (event, arg) => {
  const { uid, account, password } = arg;
  sendMessage("manage", "delete-account-reply", {
    success: AccountManager.getInstance().deleteAccount(uid),
    message: { uid },
  });
});
//修改
ipcMain.on("modify-account", (event, arg) => {
  const { uid, tips, account, password } = arg;
  const ret = AccountManager.getInstance().updateAll({
    uid,
    tips,
    account,
    password,
  });
  if (ret !== "OK") {
    sendMessage("manage", "modify-account-reply", {
      message: ret,
      success: false,
      uid,
    });
  } else {
    sendMessage("manage", "modify-account-reply", {
      success: true,
      uid,
    });
  }
});
//保存
ipcMain.on("save-account", (event, arg) => {
  let success = AccountManager.getInstance().storeToFile();
  let message = success === true ? "成功" : "失败";
  sendMessage("manage", "save-account-reply", { success, message });
});
//新建
ipcMain.on("create-account", (event, arg) => {
  const { uid, account, password, tips } = arg;
  let ret = AccountManager.getInstance().addAccount(arg);
  if (ret !== "OK")
    sendMessage("manage", "create-account-reply", {
      message: ret,
      success: false,
      uid,
      account,
      password,
      tips,
    });
  else
    sendMessage("manage", "create-account-reply", {
      message: ret,
      success: true,
      uid,
      account,
      password,
      tips,
    });
});
