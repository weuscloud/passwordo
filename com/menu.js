const { Menu, app } = require('electron');
const { SingleWindow, getWindow } = require("./WindowMgr");
const { getGenshinPathByDialog } = require('./page.main');
const { exec } = require('child_process');
const { iniFileName } = require('./file');

const template = [
  {
    label: 'Language',
    submenu: [
      {
        label: 'English',
        type: 'radio',
        checked: false,
        click: function () {
          // handle English click
          global._lang = 'en-US'
          SingleWindow(global.windowName);
        }
      },
      {
        label: '简体中文',
        type: 'radio',
        checked: false,
        click: function () {
          // handle Chinese click
          global._lang = 'zh-CN'
          SingleWindow(global.windowName);
        }
      },
      {
        label: 'Default',
        type: 'radio',
        checked: true,
        enabled: false, // 将该选项禁用
      }
    ]
  },
  {
    label: 'Settings',
    submenu: [
      {
        label: 'Forward game path',
        type: 'normal',
        click: function () {
          getGenshinPathByDialog()
        }
      },
      {
        label: 'Configure preference',
        type: 'normal',
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
      }
    ]
  },
  {
    label: 'Debug',
    click: function () {
      // handle about click
      getWindow(global.windowName).webContents.toggleDevTools();
    }
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

app.on('activate', function () {
  Menu.setApplicationMenu(menu);
});
module.exports = {
  menu
}