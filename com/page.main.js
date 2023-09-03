const { ipcMain, clipboard } = require("electron");
const { sendMessage } = require("./WindowMgr");
const AccountManager = require("./AccountManager");
const child_process = require("child_process");
const keyPath = `HKEY_CURRENT_USER\\Software\\miHoYo\\原神`
function deleteKey(keypath) {
  return new Promise((R, J) => {
    try {
      const res = child_process.exec(`reg delete ${keypath} /f`);
      R(res)
    } catch (error) {
      J(error)
    }
  })
}
ipcMain.on("query-uid", (e, a) => {
  sendMessage(
    "main",
    "query-uid-reply",
    AccountManager.getInstance().queryUID()
  );
});
ipcMain.on("clipboard-copy", (ev, arg) => {
  const { uid, isAccount } = arg;
  let acc = isAccount
    ? AccountManager.getInstance().queryAccount(uid)
    : AccountManager.getInstance().queryPassword(uid);
  if (acc.length != 0) {
    clipboard.writeText(acc);
    sendMessage("main", "clipboard-copy-reply", { success: true, isAccount, uid });
  } else {
    sendMessage("main", "clipboard-copy-reply", { success: false, isAccount, uid });
  }
});
ipcMain.on("cleareg", (ev, arg) => {
  child_process.exec('NET SESSION', function (err, so, se) {
    if (se.length !== 0) {
      sendMessage("main", "cleareg-reply", { success: false, message: `删除失败:无管理员权限` });
    } else {
      deleteKey(keyPath).then(() => {
        sendMessage("main", "cleareg-reply", { success: true, message: "删除成功" });
      }).catch((ERR) => {
        sendMessage("main", "cleareg-reply", { success: false, message: `删除失败:\n${ERR}` });
      });
    }
  });

})