const { Menu, ipcMain, app } = require('electron');
const { SingleWindow, getWindow } = require("./WindowMgr");
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
      }
    ]
  },
  {
    label: 'Settings',
    submenu: [
      {
        label: '设置原神安装路径',
        type: 'normal',
        click: function () {

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
