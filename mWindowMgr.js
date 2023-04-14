const { ipcRenderer,BrowserWindow } = require("electron");
const path = require("path");
let mgr = {};
function createWindow(name, options) {
  // 创建一个新窗口，并将其保存到 `mgr` 对象中
  mgr[name] = new BrowserWindow(options);
  // 当窗口关闭时，将其从 `mgr` 对象中移除
  mgr[name].on("closed", () => {
    mgr[name] = null;
  });
}
function loadFile(name, filename) {
  // 加载一个页面
  if (mgr[name] instanceof BrowserWindow) mgr[name].loadFile(filename);
}
function sendMessage(name, msg_type, msg_arg) {
  if (mgr[name] instanceof BrowserWindow)
    mgr[name].webContents.send(msg_type, msg_arg);
}
function getWindow(name) {
  if (mgr[name] instanceof BrowserWindow) return mgr[name];
}
function onClose(name, callback) {
  if (mgr[name] instanceof BrowserWindow && typeof callback === "function")
    mgr[name].on("closed", callback);
}
function SingleWindow(windowName) {
  if (typeof windowName !== "string") return;
  if (
    mgr[global.windowName] &&
    mgr[global.windowName] instanceof BrowserWindow
  ) {
    mgr[global.windowName].close();
    mgr[global.windowName] = null;
  }
  global.windowName=windowName;
  createWindow(windowName, {
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  loadFile(
    windowName,
    path.join(__dirname, "/page/" + windowName, windowName + ".html")
  );
}
module.exports = {
  createWindow,
  loadFile,
  getWindow,
  sendMessage,
  onClose,
  SingleWindow,
};
