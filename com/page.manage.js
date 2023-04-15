const { ipcMain } = require("electron");
const AccountManager = require("./AccountManager");
const { sendMessage } = require("./WindowMgr");
const { dialog } = require('electron');
const fs = require('fs');
const log = require("./log");
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
    uid
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
  let ret = AccountManager.getInstance().storeToFile();
  let success = ret === "OK" ? true : false;
  sendMessage("manage", "save-account-reply", { success, message:ret });
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
    });
  else
    sendMessage("manage", "create-account-reply", {
      message: ret,
      success: true,
      uid,
    });
});

//导入功能

function importFile() {
  // 打开文件选择框
  const result = dialog.showOpenDialogSync({
    properties: ['openFile'],
    filters: [
      { name: 'AES256G files', extensions: ['aes256g'] }
    ]
  });

  if (result && result.length > 0) {
    const filePath = result[0];
    log("file import path=", filePath);
    return filePath;
  }

  return null;
}

ipcMain.on("import-account",(e,a)=>{
  const filePath=importFile();
  if(filePath===null)return;
  let ret=AccountManager.getInstance().readFromFile(filePath);
  if(ret==="OK"){
    //更新
    sendMessage(
      "manage",
      "import-account-reply",
      {
        accounts:AccountManager.getInstance().query(),
        success:true,
      }
    );
  }else{
    sendMessage(
      "manage",
      "import-account-reply",
      {
        message:ret,
        success:false
      }
    );
  }
})