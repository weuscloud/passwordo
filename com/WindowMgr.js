const { ipcRenderer,BrowserWindow } = require("electron");
const path = require("path");
let mgr = {};
function createWindow(name, options) {
  // 创建一个新窗口，并将其保存到 `mgr` 对象中
  if(getWindow(name) instanceof BrowserWindow){
    mgr[name].close();
    delete mgr.name;
  }else{
    global.windowName=name;
  }
  mgr[name] = new BrowserWindow(options);
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
  Object.keys(mgr).every((name)=>{
    mgr[name].close();
    delete mgr[name];
  })
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
    path.join(__dirname,"../", "/page/" + windowName, windowName + ".html")
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
