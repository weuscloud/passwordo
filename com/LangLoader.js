
const { ipcMain, app } = require("electron");
const zh = require('../locales/zh.json');
const en = require('../locales/en.json');
const LangObj = {
  'zh-CN': zh,
  'en-US': en,
}
ipcMain.on("get-lang-data", (event, arg) => {
  const {lang}=arg;
  if(!global._lang)global._lang=lang;
  event.sender.send("get-lang-data-reply", {
    langData: LangObj[global._lang],
    success: true,
  });
});
