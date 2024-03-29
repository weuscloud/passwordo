const { ipcMain, dialog, clipboard } = require("electron");
const { sendMessage, getWindow } = require("./WindowMgr");
const AccountManager = require("./AccountManager");
const fs = require('fs');
const { exec, spawn } = require('child_process');
const JsonFileHandler = require('./JsonFileHandler')
const { iniFileName } = require('./file');
const log = require("./log");
const keyPath = `HKEY_CURRENT_USER\\Software\\miHoYo\\原神`

ipcMain.on('copy-cdkey', (e, a) => {
  const jsonHandler = new JsonFileHandler(iniFileName);
  const key = jsonHandler.getValue(`cdkey${a}`);
  if (key) {
    clipboard.writeText(key);
    e.sender.send('copy-cdkey-reply',{success:true});
  } else {
    log("ERROR",__filename,`复制cdkey${a}失败`)
    e.sender.send('copy-cdkey-reply',{success:false});
    jsonHandler.update(`cdkey${a}`, '')
    jsonHandler.write()
  }

})

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
  if (deleteKey(keyPath)) {
    ev.sender.send("cleareg-reply", { success: true, message: `{SignOutGenshinSuccessed}\n` });
    return;
  }
  ev.sender.send("cleareg-reply", { success: false, message: `{SignOutGenshinFailed}\n` });
})
ipcMain.on('start-genshin', async (ev, arg) => {

  let genshinPath = await getGenshinPath();
  //启动原神
  if (genshinPath) {
    openYuanshen(genshinPath)
  }
  ev.sender.send('start-genshin-reply', { success: true })
})
function deleteKey(keypath) {
  try {
    const command = 'reg';
    const args = ['delete', keypath, '/f'];
    const child = spawn(command, args);
    return true;
  } catch (error) {
    log('ERROR', __filename, '注册表权限不足', error);
    return false;
  }
}
function getGenshinPathByReg() {
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
            const exePath = `${InstallPath.trim()}\\Genshin Impact Game\\yuanshen.exe`;
            log('INFO', __filename, `从注册表更新原神安装路径:`, exePath);
            const jsonHandler = new JsonFileHandler(iniFileName);
            jsonHandler.update('GenshinInstallPath', exePath);
            jsonHandler.write();
            resolve(exePath);
          }
        }
      });

      // 如果未找到匹配项，也解析为 null
      resolve(null);
    });
  });
}
// 执行命令来打开用户选择的 EXE 文件
async function getGenshinPathByDialog() {
  try {
    const result = await
      dialog.showOpenDialog({
        title: '选择 Genshin Impact EXE 文件',
        properties: ['openFile'],
        filters: [{ name: 'EXE 文件', extensions: ['exe'] }],
      });
    if (!result.canceled && result.filePaths.length > 0) {
      const exePath = result.filePaths[0];

      log('INFO', __filename, `用户选择原神安装路径:`, exePath);
      const jsonHandler = new JsonFileHandler(iniFileName);
      jsonHandler.update('GenshinInstallPath', exePath);
      jsonHandler.write();
      return exePath;

    } else {
      return;
    }
  } catch (error) {

  }
}
async function getGenshinPath() {
  const jsonHandler = new JsonFileHandler(iniFileName);
  let instPath = jsonHandler.getValue('GenshinInstallPath');
  if (instPath) return instPath;
  log('ERROR', __filename, `从配置读取路径原神安装路径失败`, error);
  try {
    const registryPath = await getGenshinPathByReg();
    if (registryPath) {
      const jsonHandler = new JsonFileHandler(iniFileName);
      jsonHandler.update('GenshinInstallPath', registryPath);
      jsonHandler.write();
      return registryPath;
    } else {
      log('ERROR', __filename, `从注册表读取路径原神安装路径：为空`);
      return await getGenshinPathByDialog();
    }
  } catch (error) {
    log('ERROR', __filename, `从注册表读取路径原神安装路径失败`, error);
    return await getGenshinPathByDialog();
  }
}

function openYuanshen(genshinPath) {
  exec(`start "" "${genshinPath}"`, (error, stdout, stderr) => {
    if (error) {
      log('INFO', __filename, `无法打开程序: 用户取消!`);
      return;
    }
  });
}
module.exports = {
  getGenshinPathByDialog
}
