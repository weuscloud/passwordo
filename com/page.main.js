const { ipcMain, dialog, clipboard } = require("electron");
const { sendMessage, getWindow } = require("./WindowMgr");
const AccountManager = require("./AccountManager");
const fs = require('fs');
const { exec } = require('child_process');
const JsonFileHandler = require('./JsonFileHandler')
const { iniFileName } = require('./file');
const log = require("./log");
const keyPath = `HKEY_CURRENT_USER\\Software\\miHoYo\\原神`
function deleteKey(keypath) {
  return new Promise((R, J) => {
    try {
      const res = exec(`reg delete ${keypath} /f`);
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
  exec('NET SESSION', function (err, so, se) {
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


function getYuanInstallPath() {
  return new Promise((resolve, reject) => {
    // 要查找的应用程序名称
    const targetApplication = 'Genshin Impact';

    // 构建查询注册表的命令
    const regQueryCommand = `reg query "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall" /s /f "${targetApplication}"`;

    // 执行命令
    exec(regQueryCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`执行命令时出错: ${error.message}`);
        reject(error);
        return;
      }

      // 分割查询结果为行数组
      const lines = stdout.split('\n');

      // 遍历每一行以查找匹配项
      lines.forEach(line => {
        if (line.includes('InstallPath')) {
          const InstallPath = line.split('    ')[3];

          const appName = InstallPath.substring(InstallPath.lastIndexOf('\\') + 1);
          if (appName.trim() === targetApplication.trim()) {
            resolve(`${InstallPath.trim()}\\Genshin Impact Game\\yuanshen.exe`);
          }
        }
      });

      // 如果未找到匹配项，也解析为 null
      resolve(null);
    });
  });
}
function openDialog2getYuanPath() {
  // 如果未找到应用程序的安装路径，弹出文件选择对话框
  dialog.showOpenDialog({
    title: '选择 Genshin Impact EXE 文件',
    properties: ['openFile'],
    filters: [{ name: 'EXE 文件', extensions: ['exe'] }],
  }).then(result => {
    if (!result.canceled && result.filePaths.length > 0) {
      const exePath = result.filePaths[0];
      // 执行命令来打开用户选择的 EXE 文件
      openYuanshen(exePath);
    } else {
    }
  }).catch(error => {
    console.error(`发生错误: ${error.message}`);
  });
}

ipcMain.on('start-genshin', (ev, arg) => {

  const jsonHandler = new JsonFileHandler(iniFileName); // 假设配置文件为 config.json

  // 读取特定属性的值
  jsonHandler.getValue('GenshinInstallPath')
    .then((genshinPath) => {
      log('INFO', __filename, genshinPath);
      openYuanshen(genshinPath);
    })
    .catch((err) => {
      log('ERROR', __filename, 'EMPTYED GENSHIN INSTALL PATH ', err);
      getYuanInstallPath().then(INSTALLPATH => {
        if (INSTALLPATH) {
          jsonHandler.update('GenshinInstallPath', INSTALLPATH);
          openYuanshen(INSTALLPATH);
        } else {
          log('ERROR', __filename, 'GET GENSHIN INSTALL PATH NULL');
          openDialog2getYuanPath();
        }
      })
    });

})
function openYuanshen(exePath) {
  exec(`start "" "${exePath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`无法打开程序: ${error.message}`);
      return;
    }
    getWindow('main').minimize();
  });
}