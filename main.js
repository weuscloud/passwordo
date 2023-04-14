// main.js
const { app, ipcMain, Menu, globalShortcut } = require("electron");



// 处于生产环境
// 禁用所有的快捷键

const { SingleWindow } = require("./mWindowMgr");

// 应用程序启动时创建窗口
app.on("ready", () => {
  //createLoginWindow();
  //createMainWindow();
  //globalShortcut.unregisterAll();
  // 隐藏菜单栏和禁用快捷键
  Menu.setApplicationMenu(null);
  SingleWindow("login");
});

//切换逻辑
ipcMain.on("go-to", (event, pageName) => {
  if (typeof pageName === "string") {
    SingleWindow(pageName);
  }
});
//login
require("./page.login.main");

//manage
require("./page.manage.main");

//main
require("./page.main");
