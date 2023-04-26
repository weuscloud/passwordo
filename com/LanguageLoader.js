const { ipcMain, app } = require("electron");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const log = require("./log");
const AdmZip = require("adm-zip");
const LOADER_STATE = {
  FAILURE: 1,
  SUCCESS: 0,
  PENDING: -1,
};
const Lang = {
  China: "zh",
  LANGFILENOTEXISTED: "en",
};
class LanguageLoader {
  STATE = LOADER_STATE["PENDING"];
  constructor() {
    const ctr = getCountryName();
    if (ctr in Lang) {
      this.lang = Lang[ctr];
    } else this.lang = "en";
    log(ctr, this.lang);
    this.langData = {};
  }

  // 加载语言文件
  loadLanguageData() {
    try {
      const langFolderPath = path.join(app.getPath("userData"), "locales");
      if (!fs.existsSync(langFolderPath)) {
        fs.mkdirSync(langFolderPath);
      }

      const langFilePath = path.join(langFolderPath, `${this.lang}.json`);
      const fileExists = fs.existsSync(langFilePath);
      if (!fileExists) {
        const langZipPath = path.join(langFolderPath, "lang.zip");
        const langZipUrl = process.env.LANG_SERVER;
        axios
          .get(langZipUrl, { responseType: "stream" })
          .then((response) => {
            const writer = fs.createWriteStream(langZipPath);
            response.data.pipe(writer);
            writer.on("finish", () => {
              const zip = new AdmZip(langZipPath);
              zip.extractAllToAsync(langFolderPath, true, (err) => {
                if (err) {
                  reject(err);
                } else {
                  console.log(`Extracted ${langZipPath} to ${langFolderPath}`);
                  this.langData = JSON.parse(
                    fs.readFileSync(langFilePath, "utf8")
                  );
                  fs.unlink(langZipPath,()=>{});
                  this.STATE = LOADER_STATE["SUCCESS"];
                }
              });
            });
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        this.langData = JSON.parse(fs.readFileSync(langFilePath, "utf8"));
        this.STATE = LOADER_STATE["SUCCESS"];
      }
    } catch (error) {
      log(3, `Failed to load language file: ${error.message}`);
      this.langData = {};
      this.STATE = LOADER_STATE["FAILURE"];
    }
  }

  getState() {
    return this.STATE;
  }
  // 切换语言
  setLanguage(newLang) {
    if (validLanguages.includes(newLang)) {
      // 语言合法
      this.lang = newLang;

      return true;
    } else {
      // 语言不合法
      const errorMsg = `Invalid language: ${newLang}`;
      log(3, "languageError", errorMsg);
      this.STATE = LOADER_STATE["FAILURE"];
      return false;
    }
  }
  getLangData() {
    return this.langData || {};
  }
}
const langLoader = new LanguageLoader();
langLoader.loadLanguageData();
// 监听来自渲染进程的消息，发送语言数据
ipcMain.on("get-lang-data", (event, arg) => {
  event.sender.send("get-lang-data-reply", {
    langData: langLoader.getLangData(),
    success: langLoader.getState() === LOADER_STATE["SUCCESS"],
  });
});
ipcMain.on("set-lang", (e, a) => {
  const { lang } = a;
  if (lang && typeof lang === "string") {
    langLoader.setLanguage(lang);
    langLoader.loadLanguageData();
    e.sender.send("get-lang-data-reply", {
      langData: langLoader.getLangData(),
      success: langLoader.getState() === LOADER_STATE["SUCCESS"],
    });
  }
});

function getCountryName() {
  const filePath = path.join(app.getPath("userData"), "user.json");
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    const data = fs.readFileSync(filePath, "utf-8");
    const userData =
      data.length < 10
        ? { country_name: "LANGFILENOTEXISTED" }
        : JSON.parse(data);
    return userData.country_name;
  } catch (error) {
    log("user data", " not found.");
    axios
      .get(process.env.IPGO_URL)
      .then((response) => {
        fs.writeFileSync(filePath, JSON.stringify(response.data));
      })
      .catch((error) => {
        log(error);
      });
    return "LANGFILENOTEXISTED";
  }
}
