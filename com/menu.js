const { Menu, app } = require('electron');
const { SingleWindow,sendMessage, getWindow } = require("./WindowMgr");
const { getGenshinPathByDialog } = require('./page.main');
const { exec } = require('child_process');
const { iniFileName, encryptedFileName, getBackupFileName } = require('./file');
const log = require('./log');
const path = require('path');
const { LangObj } = require('./LangLoader');
Menu.setApplicationMenu(null);
// 定义一个包含菜单项标识符的数组
const menuItemsToUpdate = ['FGP', 'CP', 'BA', 'OW', 'DBG','LANG','SET','CON','RELOAD'];
let template = [
  {
    label: 'Language',
    id:"LANG",
    submenu: [
      {
        label: 'English',
        type: 'normal',
        checked: false,
        click: function () {
          // handle English click
          global._lang = 'en-US'
          SingleWindow(global.windowName);
        }
      },
      {
        label: '简体中文',
        type: 'normal',
        checked: false,
        click: function () {
          // handle Chinese click
          global._lang = 'zh-CN'
          SingleWindow(global.windowName);
        }
      }
    ]
  },
  {
    label: 'Settings',
    id:"SET",
    submenu: [
      {
        label: 'Forward game path',
        type: 'normal',
        id: 'FGP',
        click: function () {
          getGenshinPathByDialog()
        }
      },
      {
        label: 'Configure preference',
        type: 'normal',
        id: "CP",
        click: function () {
          // 使用记事本打开文件
          exec(`notepad.exe "${iniFileName}"`, (error, stdout, stderr) => {
            if (error) {
              console.error(`Error opening file: ${error.message}`);
              return;
            }
            if (stderr) {
              console.error(`Error output: ${stderr}`);
              return;
            }
          });
        }
      },
      {
        label: 'Backup accounts',
        type: 'normal',
        id: "BA",
        click: function () {
          // 要复制的源文件和目标文件的路径
          const sourceFile = encryptedFileName;
          const targetFile = getBackupFileName();

          // 根据操作系统选择适当的复制命令
          const copyCommand = process.platform === 'win32' ? `copy ${sourceFile} ${targetFile}` : `cp ${sourceFile} ${targetFile}`;

          // 执行复制命令
          exec(copyCommand, (error, stdout, stderr) => {
            if (error) {
              log('ERROR', __filename, `复制文件时出错: ${error}`);
              return;
            }
            log('INFO', __filename, `文件已成功复制: ${sourceFile} -> ${targetFile}`);
          });
        }
      },
      {
        label: 'Open workdir',
        type: 'normal',
        id: "OW",
        click: function () {
          exec(`explorer.exe "${path.dirname(iniFileName)}"`, (error, stdout, stderr) => {
            if (error) {
              console.error(`Error opening file: ${error.message}`);
              return;
            }
            if (stderr) {
              console.error(`Error output: ${stderr}`);
              return;
            }
          });
        }
      }
    ]
  },
  {
    label: 'Debug',
    id: "DBG",
    submenu:[
      {
        label: 'CONSOLE',
        id: "CON",
        click: function () {
          // handle about click
          getWindow(global.windowName).webContents.toggleDevTools();
        }
      },
      {
        label: 'Reload',
        id: "RELOAD",
        click: function () {
          // handle about click
          sendMessage(global.windowName,'reload',true);
         
        }
      }
    ]
  }
];
// 递归函数来更新label属性



function updateMenuTextAll(langData) {
  if (!langData) return;
  const obj = langData;

  //匹配翻译对象
  const labelUpdates  = {};
  menuItemsToUpdate.forEach(key => {
    if (obj.hasOwnProperty(key)) {
      labelUpdates [key] = obj[key];
    }
  });
  updateLabelRecursive(template,labelUpdates);
  global._menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(global._menu);
}
function updateLabelRecursive(menuItems, labelUpdates) {
  for (const menuItem of menuItems) {
    if (menuItem.submenu) {
      // 如果menuItem有子菜单，递归调用此函数来处理子菜单
      updateLabelRecursive(menuItem.submenu, labelUpdates);
    }
    if (labelUpdates[menuItem.id]) {
      // 如果存在与id匹配的更新，更新label属性
      menuItem.label = labelUpdates[menuItem.id];
    }
  }
}

// 使用 Object.defineProperty 来监视 _lang
Object.defineProperty(global, '_lang', {
  get() {
    return this._langValue;
  },
  set(newLang) {
    // 在语言发生变化时触发自定义操作
    console.log(`Language changed to ${newLang}`);
    // 可以在这里执行其他操作，例如加载新的语言资源等
    if (LangObj[newLang]) {
      updateMenuTextAll(LangObj[newLang])
    } else {
      log("ERROR", __filename, "语言匹配失败", newLang);
    }
    // 更新 _langValue
    this._langValue = newLang;
  },
  enumerable: true, // 让 _lang 可枚举
  configurable: true, // 让 _lang 可配置
});
