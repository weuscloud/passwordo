const { Menu, app } = require('electron');
const { SingleWindow, getWindow } = require("./WindowMgr");
const { openDialog2getYuanPath } = require('./page.main');

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
        label: 'RESET GENSHIN PATH',
        type: 'normal',
        click: function () {
          openDialog2getYuanPath()
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