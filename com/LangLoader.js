
const { ipcMain,app } = require("electron");
const zh=require('../locales/zh.json');
const en=require('../locales/en.json');
const log=require('./log');
const LangObj={
  'zh-CN':zh,
  'en-US':en,
}
ipcMain.on("get-lang-data",  (event, arg) => {
  const {lang}=arg;
  log(lang);
  event.sender.send("get-lang-data-reply", {
    langData:LangObj[lang],
    success: true,
  });
});

