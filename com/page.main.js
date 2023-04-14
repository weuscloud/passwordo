const { ipcMain,clipboard } = require("electron");
const { sendMessage } = require("./WindowMgr");
const AccountManager = require("./AccountManager");

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
    sendMessage("main", "clipboard-copy-reply", { success: true, isAccount });
  } else {
    sendMessage("main", "clipboard-copy-reply", { success: false, isAccount });
  }
});
