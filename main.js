// main.js
require('./com/global');
const { app, ipcMain, Menu } = require("electron");
require('dotenv').config();
require('./com/menu');
const { SingleWindow } = require("./com/WindowMgr");

// 应用程序启动时创建窗口
app.on("ready", () => {
  //globalShortcut.unregisterAll();
  // 隐藏菜单栏和禁用快捷键

  SingleWindow("login");
});

//切换逻辑
ipcMain.on("go-to", (event, pageName) => {
  if (typeof pageName === "string") {
    SingleWindow(pageName);
  }
});
//login
require("./com/page.login");

//manage
require("./com/page.manage");

//main
require("./com/page.main");

//lang-loader
require("./com/LangLoader");